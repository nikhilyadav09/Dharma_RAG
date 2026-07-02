"""Verify API startup does not eagerly import heavy ML dependencies."""

import ast
from pathlib import Path


def _top_level_imports(path: Path) -> list[str]:
    tree = ast.parse(path.read_text(encoding="utf-8"))
    modules: list[str] = []
    for node in tree.body:
        if isinstance(node, ast.ImportFrom) and node.module:
            modules.append(node.module)
    return modules


def test_api_layer_avoids_eager_pipeline_import():
    """api/ must not import src.core.pipeline at module load time."""
    api_root = Path(__file__).resolve().parents[1] / "api"
    offenders: list[str] = []
    for path in api_root.rglob("*.py"):
        if path.name == "__init__.py":
            continue
        for module in _top_level_imports(path):
            if module.startswith("src.core"):
                offenders.append(f"{path.relative_to(api_root)} -> {module}")
    assert offenders == [], f"Eager heavy imports found: {offenders}"


def test_import_main_without_torch(monkeypatch):
    """Loading api.main should not pull torch before first chat request."""
    import sys

    for name in list(sys.modules):
        if name == "torch" or name.startswith("torch."):
            monkeypatch.delitem(sys.modules, name, raising=False)

    import importlib

    if "api.main" in sys.modules:
        importlib.reload(sys.modules["api.main"])
    else:
        importlib.import_module("api.main")

    assert "torch" not in sys.modules
