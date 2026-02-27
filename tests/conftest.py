import copy

import pytest

from src import app


@pytest.fixture(autouse=True)
def reset_activities():
    """
    Preserve the original in‑memory activities state and restore it
    after each test.  This allows tests to run in isolation without
    bleeding mutations into one another.
    """
    original = copy.deepcopy(app.activities)
    yield
    app.activities = copy.deepcopy(original)
