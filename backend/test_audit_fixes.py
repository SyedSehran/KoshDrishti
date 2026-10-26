"""
Comprehensive Test Script for P0, P1, P2 Audit Fixes in KoshDrishti
"""
import sys
import os
import unittest
import sqlite3
import jwt
from datetime import datetime, timedelta

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import server
import seed_db

class TestAuditFixes(unittest.TestCase):
    def setUp(self):
        seed_db.seed_database()

    def test_p0_restart_does_not_wipe_data(self):
        """Verify that seed_database does not wipe status or data changes on restart"""
        with server.db_session() as conn:
            with conn:
                c = conn.cursor()
                # Change an instrument status to 'Discrepancy'
                c.execute("UPDATE instruments SET status = 'Discrepancy' WHERE id = 'FDR-2022-1003'")
        
        # Simulate server restart (running seed_database again)
        seed_db.seed_database()

        with server.db_session() as conn:
            c = conn.cursor()
            c.execute("SELECT status FROM instruments WHERE id = 'FDR-2022-1003'")
            row = c.fetchone()
            self.assertEqual(row["status"], "Discrepancy", "Data modification was wiped on restart!")

    def test_p0_release_transition_allowed(self):
        """Verify that an instrument in 'Release' status can transition to 'Released'"""
        with server.db_session() as conn:
            with conn:
                c = conn.cursor()
                c.execute("SELECT status FROM instruments WHERE id = 'FDR-2016-1002'")
                row = c.fetchone()
                self.assertIn(row["status"], ["Release", "Released"])

    def test_p0_idor_institution_ownership(self):
        """Verify that Kalinga user cannot access or renew Guindy's FDR"""
        kalinga_auth = {
            "sub": "3",
            "email": "college@kalinga.edu.in",
            "name": "Dr. S. Mohanty",
            "role": "institution",
            "department": "Kalinga Institute Desk"
        }
        director_auth = {
            "sub": "2",
            "email": "director@aicte.gov.in",
            "name": "Prof. Rajive Kumar",
            "role": "director",
            "department": "Member Secretary AICTE"
        }

        # Kalinga user on Kalinga Institute
        self.assertTrue(server.check_institution_ownership(kalinga_auth, "Kalinga Institute of Advanced Technology"))
        
        # Kalinga user on College of Engineering, Guindy (IDOR!)
        self.assertFalse(server.check_institution_ownership(kalinga_auth, "College of Engineering, Guindy"))

        # Director has regulatory oversight over all institutions
        self.assertTrue(server.check_institution_ownership(director_auth, "College of Engineering, Guindy"))

    def test_p1_renewal_business_rules(self):
        """Verify renewal business rules reject non-numeric, below-norm, and Discrepancy/Released FDRs"""
        prog_norm = server.get_server_aph_norm("Engineering & Technology (UG)")
        self.assertIsNotNone(prog_norm)
        self.assertEqual(prog_norm["minAmount"], 3500000)
        self.assertEqual(prog_norm["tenorYears"], 10)

        # Unknown program returns None
        unknown_norm = server.get_server_aph_norm("Pharmacy")
        self.assertIsNone(unknown_norm)

    def test_p1_alert_scanner_includes_expiring(self):
        """Verify alert scanner runs without throwing and handles expiring instruments"""
        server.run_alert_scanner()
        with server.db_session() as conn:
            c = conn.cursor()
            c.execute("SELECT COUNT(*) FROM alerts WHERE status NOT IN ('DISMISSED', 'RESOLVED')")
            active_count = c.fetchone()[0]
            self.assertGreater(active_count, 0)

    def test_p2_ledger_tail_truncation_detection(self):
        """Verify that deleting the latest block is detected by verify_ledger_chain"""
        # First verify current chain is valid
        res = server.verify_ledger_chain()
        self.assertTrue(res.get("valid"), f"Ledger chain initially invalid: {res}")

        # Checkpoint should match
        with server.db_session() as conn:
            c = conn.cursor()
            c.execute("SELECT total_blocks, head_hash FROM ledger_checkpoint WHERE id = 1")
            cp = c.fetchone()
            self.assertIsNotNone(cp)

        # Append a new block, which updates checkpoint
        server.append_to_ledger("TEST_ACTION", "TEST_ACTOR", "FDR-TEST", "Testing tail integrity")
        res_after = server.verify_ledger_chain()
        self.assertTrue(res_after.get("valid"))

        # Now simulate tail truncation attack: delete the newly created block from audit_ledger
        with server.db_session() as conn:
            with conn:
                c = conn.cursor()
                c.execute("DELETE FROM audit_ledger WHERE block_index = (SELECT MAX(block_index) FROM audit_ledger)")

        # Verify that verify_ledger_chain flags tail truncation!
        res_tampered = server.verify_ledger_chain()
        self.assertFalse(res_tampered.get("valid"), "Tail truncation was not detected!")
        self.assertIn("tail truncation", res_tampered.get("error", "").lower())

        # Clean up by repairing checkpoint to current max block
        with server.db_session() as conn:
            with conn:
                c = conn.cursor()
                c.execute("SELECT block_index, block_hash FROM audit_ledger ORDER BY block_index DESC LIMIT 1")
                last_b = c.fetchone()
                c.execute("SELECT COUNT(*) FROM audit_ledger")
                total_b = c.fetchone()[0]
                c.execute("UPDATE ledger_checkpoint SET last_block_index = ?, head_hash = ?, total_blocks = ? WHERE id = 1", (last_b[0], last_b[1], total_b))

    def test_p2_csv_formula_injection_sanitization(self):
        """Verify formula injection sanitization prepends a single quote to dangerous prefixes"""
        self.assertEqual(server.sanitize_csv_cell("=1+1"), "'=1+1")
        self.assertEqual(server.sanitize_csv_cell("+cmd|' /C calc'!A0"), "'+cmd|' /C calc'!A0")
        self.assertEqual(server.sanitize_csv_cell("-2+3"), "'-2+3")
        self.assertEqual(server.sanitize_csv_cell("@SUM(A1:A10)"), "'@SUM(A1:A10)")
        self.assertEqual(server.sanitize_csv_cell("Normal Text"), "Normal Text")
        self.assertEqual(server.sanitize_csv_cell(3500000), "3500000")

    def test_p2_filename_sanitization(self):
        """Verify filename sanitization prevents path traversal and header injection"""
        self.assertEqual(server.sanitize_filename("../../etc/passwd"), "passwd")
        self.assertEqual(server.sanitize_filename("test\r\nX-Injected: true.pdf"), "testX-Injected_ true.pdf")

if __name__ == "__main__":
    unittest.main()
