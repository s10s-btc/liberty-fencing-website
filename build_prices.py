#!/usr/bin/env python3
"""
build_prices.py - Central pricing build script

USAGE:
    python3 build_prices.py              # build with real values
    python3 build_prices.py --dry-run   # preview only

WHEN TO RUN:
    Whenever Coop changes prices.json
"""

import json
import re
import sys
from pathlib import Path

PRICES_FILE = Path(__file__).parent / "prices.json"
WEB_ROOT = Path(__file__).parent

# Map of placeholder names -> JSON path (list of keys to walk)
PLACEHOLDERS = {
    # Chain-link
    "CL_GALV_PRICE":         ["fences", "chain_link_4ft_galvanized", "price_per_ft"],
    "CL_BLACK_PRICE":        ["fences", "chain_link_4ft_black", "price_per_ft"],
    "CL_SINGLE_GATE_PRICE":  ["gates", "chain_link_single", "price"],
    "CL_DOUBLE_GATE_PRICE":  ["gates", "chain_link_double", "price"],
    # Wood
    "WP_PRICE":              ["fences", "wood_pine_6ft", "price_per_ft"],
    "WC_PRICE":              ["fences", "wood_cedar_6ft", "price_per_ft"],
    "WP_SINGLE_GATE_PRICE":  ["gates", "wood_pine_single", "price"],
    "WP_DOUBLE_GATE_PRICE":  ["gates", "wood_pine_double", "price"],
    "WC_SINGLE_GATE_PRICE":  ["gates", "wood_cedar_single", "price"],
    "WC_DOUBLE_GATE_PRICE":  ["gates", "wood_cedar_double", "price"],
    # Vinyl
    "VN_PRICE":              ["fences", "vinyl_white_6ft", "price_per_ft"],
    "VN_SINGLE_GATE_PRICE":  ["gates", "vinyl_single", "price"],
    "VN_DOUBLE_GATE_PRICE":  ["gates", "vinyl_double", "price"],
    # Aluminum
    "AL_PRICE":              ["fences", "aluminum_ornamental", "price_per_ft"],
    "AL_SINGLE_GATE_PRICE":  ["gates", "aluminum_single", "price"],
    "AL_DOUBLE_GATE_PRICE":  ["gates", "aluminum_double", "price"],
    # Package variations (index.html packages carousel)
    # Path: packages -> pkg_key -> variations[index] -> field
    "PKG_CL_BASIC_PRICE":    ["packages", "chain-link", "variations", 0, "price"],
    "PKG_CL_STANDARD_PRICE": ["packages", "chain-link", "variations", 1, "price"],
    "PKG_CL_PREMIUM_PRICE":  ["packages", "chain-link", "variations", 2, "price"],
    "PKG_AL_BASIC_PRICE":    ["packages", "aluminum", "variations", 0, "price"],
    "PKG_AL_PREMIUM_PRICE":   ["packages", "aluminum", "variations", 1, "price"],
    "PKG_WP_BASIC_PRICE":    ["packages", "wood-pine", "variations", 0, "price"],
    "PKG_WP_STANDARD_PRICE": ["packages", "wood-pine", "variations", 1, "price"],
    "PKG_WP_PREMIUM_PRICE":  ["packages", "wood-pine", "variations", 2, "price"],
    "PKG_VN_BASIC_PRICE":    ["packages", "vinyl", "variations", 0, "price"],
    "PKG_VN_STANDARD_PRICE": ["packages", "vinyl", "variations", 1, "price"],
    }

# Suffix to add (/LF for per-foot prices, nothing for gate/total prices)
SUFFIXES = {
    "CL_GALV_PRICE": "/LF", "CL_BLACK_PRICE": "/LF",
    "WP_PRICE": "/LF", "WC_PRICE": "/LF",
    "VN_PRICE": "/LF", "AL_PRICE": "/LF",
}


def get_value(prices, path):
    """Walk the path through prices dict. Path entries that are numeric access list indices."""
    current = prices
    for key in path:
        if current is None:
            return None
        # If current is a dict and key is a digit string, the key is probably an index
        # Actually no - we need to know if we expect a list or dict.
        # Heuristic: if path is numeric and current is a dict, look for "variations" key first
        if isinstance(current, dict):
            current = current.get(key)
        elif isinstance(current, list):
            try:
                idx = int(key)
                if idx < len(current):
                    current = current[idx]
                else:
                    return None
            except (ValueError, TypeError):
                return None
        else:
            return None
    return current


def format_price(value, suffix=""):
    if value is None:
        return ""
    if isinstance(value, (int, float)):
        return f"${value:,.0f}" + suffix
    return str(value) + suffix


def main():
    dry_run = "--dry-run" in sys.argv

    if not PRICES_FILE.exists():
        print(f"ERROR: {PRICES_FILE} not found")
        sys.exit(1)

    print(f"{'[DRY RUN] ' if dry_run else ''}Building prices from {PRICES_FILE.name}")
    print()

    with open(PRICES_FILE) as f:
        prices = json.load(f)

    html_files = sorted(WEB_ROOT.glob("*.html"))

    total_replacements = 0
    for html_file in html_files:
        with open(html_file) as f:
            content = f.read()

        replacements = []
        for placeholder, path in PLACEHOLDERS.items():
            token = "{{" + placeholder + "}}"
            if token in content:
                value = get_value(prices, path)
                suffix = SUFFIXES.get(placeholder, "")
                formatted = format_price(value, suffix)
                if value is not None and formatted:
                    replacements.append((token, formatted))

        if replacements:
            print(f"📄 {html_file.name}:")
            for old, new in replacements:
                print(f"   {old} → {new}")
            total_replacements += len(replacements)

            if not dry_run:
                new_content = content
                for old, new in replacements:
                    new_content = new_content.replace(old, new)
                with open(html_file, 'w') as f:
                    f.write(new_content)

    print()
    if total_replacements == 0:
        print("✅ No placeholders found - nothing to build.")
    else:
        print(f"✅ {total_replacements} placeholder(s) replaced.")


if __name__ == "__main__":
    main()
