const axios = require('axios');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

async function runTests() {
  const SECRET = 'replace-with-a-long-random-secret';
  const token = jwt.sign({ userId: new ObjectId().toString(), role: 'LIBRARIAN_STAFF' }, SECRET, { expiresIn: '1d' });
  const authHeader = { Authorization: `Bearer ${token}` };
  
  // Unauth token for rejection test
  const unauthToken = jwt.sign({ userId: new ObjectId().toString(), role: 'MEMBER' }, SECRET, { expiresIn: '1d' });

  const BASE_URL = 'http://localhost:3000/api';
  let passed = 0;
  let failed = 0;
  const results = [];

  function assert(condition, message) {
    if (condition) {
      passed++;
      results.push(`✅ PASS: ${message}`);
    } else {
      failed++;
      results.push(`❌ FAIL: ${message}`);
    }
  }

  try {
    console.log('--- Starting Module 11 Verification ---\n');

    // 1. Fetch an existing Book first
    let bookId;
    try {
      const bookRes = await axios.get(`${BASE_URL}/books?limit=1`, { headers: authHeader });
      bookId = bookRes.data.items[0]._id;
      assert(bookId, `Fetched existing book for testing: ${bookId}`);
    } catch (e) {
      console.log(e.response?.data);
      throw new Error('Failed to fetch book: ' + e.message);
    }

    // 2. Create Copy
    let copyId;
    let accessionNumber = `ACC-${Date.now()}`;
    try {
      const createRes = await axios.post(`${BASE_URL}/books/${bookId}/copies`, {
        accessionNumber: accessionNumber,
        barcode: `BC-${Date.now()}`,
        condition: 'New'
      }, { headers: authHeader });
      copyId = createRes.data._id;
      assert(copyId && createRes.data.status === 'Available', `Created copy successfully: ${copyId}`);
    } catch (e) {
      assert(false, `Create copy failed: ${e.response?.data?.message || e.message}`);
    }

    // 3. Duplicate Accession Rejection
    try {
      await axios.post(`${BASE_URL}/books/${bookId}/copies`, {
        accessionNumber: accessionNumber,
        barcode: `BC2-${Date.now()}`
      }, { headers: authHeader });
      assert(false, 'Duplicate accession was NOT rejected');
    } catch (e) {
      assert(e.response?.status === 400, `Duplicate accession rejected correctly (400)`);
    }

    // 4. Unauthorized Access Rejection
    try {
      await axios.post(`${BASE_URL}/books/${bookId}/copies`, {
        accessionNumber: `ACC2-${Date.now()}`
      }, { headers: { Authorization: `Bearer ${unauthToken}` } });
      assert(false, 'Unauthorized user was able to access endpoint');
    } catch (e) {
      assert(e.response?.status === 403, `Unauthorized user rejected correctly (403)`);
    }

    // 5. List Copies and Availability
    try {
      const listRes = await axios.get(`${BASE_URL}/books/${bookId}/copies`, { headers: authHeader });
      assert(listRes.data.copies.length > 0, `Listed copies successfully (count: ${listRes.data.copies.length})`);
      assert(listRes.data.titleAvailable === true, `Backend-derived titleAvailable is true`);
    } catch(e) {
      assert(false, `List copies failed: ${e.message}`);
    }

    // 6. Edit Copy
    try {
      const editRes = await axios.patch(`${BASE_URL}/book-copies/${copyId}`, {
        condition: 'Good'
      }, { headers: authHeader });
      assert(editRes.data.condition === 'Good', `Edited copy condition successfully`);
    } catch(e) {
      assert(false, `Edit copy failed: ${e.message}`);
    }

    // 7. Invalid Status Transition via Generic endpoint
    try {
      await axios.patch(`${BASE_URL}/book-copies/${copyId}/status`, {
        status: 'Lost'
      }, { headers: authHeader });
      assert(false, 'Invalid generic status transition to Lost succeeded (it should not)');
    } catch(e) {
      assert(e.response?.status === 400, `Invalid generic status transition to Lost rejected (400)`);
    }

    // 8. Valid Status Transition
    try {
      const statusRes = await axios.patch(`${BASE_URL}/book-copies/${copyId}/status`, {
        status: 'Issued'
      }, { headers: authHeader });
      assert(statusRes.data.status === 'Issued', `Valid status transition to Issued succeeded`);
    } catch(e) {
      assert(false, `Valid status transition failed: ${e.message}`);
    }

    // 9. Availability after Issued
    try {
      const listRes2 = await axios.get(`${BASE_URL}/books/${bookId}/copies`, { headers: authHeader });
      assert(listRes2.data.titleAvailable === false, `Backend-derived titleAvailable is false after Issued`);
    } catch(e) {
      assert(false, `Failed checking availability: ${e.message}`);
    }

    // 10. Lost Workflow & Configuration fetch
    try {
      const lostRes = await axios.post(`${BASE_URL}/book-copies/${copyId}/lost-damaged`, {
        type: 'LOST',
        reason: 'Testing lost workflow'
      }, { headers: authHeader });
      assert(lostRes.data.status === 'Lost', `Lost workflow applied successfully, status is Lost`);
      assert(lostRes.data.chargeHistory.length === 1, `Charge history was created for Lost`);
      assert(lostRes.data.chargeHistory[0].workflow === 'LOST', `Charge workflow is logged accurately`);
    } catch(e) {
      console.log(e.response?.data);
      assert(false, `Lost workflow failed: ${e.response?.data?.message || e.message}`);
    }

    // 11. Found Workflow & Reversal
    try {
      const foundRes = await axios.post(`${BASE_URL}/book-copies/${copyId}/found`, {
        reason: 'Testing found workflow'
      }, { headers: authHeader });
      assert(foundRes.data.status === 'Available', `Found workflow applied successfully, status is Available`);
      assert(foundRes.data.chargeHistory.length === 2, `Charge history appended (not overwritten), total count: 2`);
      assert(foundRes.data.chargeHistory[1].type === 'REVERSAL', `Second history record is a reversal`);
    } catch(e) {
      assert(false, `Found workflow failed: ${e.message}`);
    }

    // 12. Archive Workflow
    try {
      const archRes = await axios.delete(`${BASE_URL}/book-copies/${copyId}`, { headers: authHeader });
      assert(archRes.data.status === 'Archived', `Archive workflow applied successfully, status is Archived`);
    } catch(e) {
      assert(false, `Archive workflow failed: ${e.message}`);
    }

    // 13. Archived Availability Verification
    try {
      const listRes3 = await axios.get(`${BASE_URL}/books/${bookId}/copies`, { headers: authHeader });
      assert(listRes3.data.titleAvailable === false, `Backend-derived titleAvailable is false after Archiving`);
    } catch(e) {
      assert(false, `Failed checking availability after archive: ${e.message}`);
    }

  } catch (error) {
    console.error('Fatal Test Error:', error.message);
  }

  console.log('\n--- Test Results ---');
  results.forEach(r => console.log(r));
  console.log(`\nTotal: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
}

runTests();
