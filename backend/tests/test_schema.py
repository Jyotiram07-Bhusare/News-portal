"""schema.sql splits into whole CREATE TABLE statements: a ';' inside a comment would cut one in two and break init_db.py (and every deploy)."""
import database


def test_schema_sql_is_eleven_whole_create_table_statements():
    statements = database.schema_statements()
    assert len(statements) == 11
    for statement in statements:
        assert statement.startswith("CREATE TABLE IF NOT EXISTS")
        assert statement.count("(") == statement.count(")")
        assert statement.endswith("COLLATE=utf8mb4_unicode_ci")


def test_schema_sql_has_no_foreign_keys():
    """The MySQL user that runs init_db.py on the server (lokportal_migrate) has no REFERENCES right: a FOREIGN KEY made the deploy of the
    comments fail (1142). Replies, votes and reports are deleted with their comment by the code (database.delete_comment) instead."""
    assert not [s for s in database.schema_statements() if "FOREIGN KEY" in s.upper() or "REFERENCES" in s.upper()]
