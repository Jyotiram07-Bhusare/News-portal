"""schema.sql splits into whole CREATE TABLE statements: a ';' inside a comment would cut one in two and break init_db.py (and every deploy)."""
import database


def test_schema_sql_is_five_whole_create_table_statements():
    statements = database.schema_statements()
    assert len(statements) == 5
    for statement in statements:
        assert statement.startswith("CREATE TABLE IF NOT EXISTS")
        assert statement.count("(") == statement.count(")")
        assert statement.endswith("COLLATE=utf8mb4_unicode_ci")
