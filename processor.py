import os
import re
import pdfplumber
import pandas as pd
from typing import List, Dict, Optional


class FinancialProcessor:
    """
    "Process Anything" pipeline.
    No classification. No keyword thresholds.
    Aggressively extracts any text+number patterns from every page.
    """

    def process_pdf(self, pdf_path: str, output_dir: str) -> str:
        extracted_data = self._extract_content(pdf_path)
        return self._save_to_excel(extracted_data, output_dir)

    def get_extracted_data(self, pdf_path: str) -> Dict:
        """
        Returns a dict with 'Balance Sheet', 'Profit and Loss' and optional 'warning'.
        Never returns None — always returns something.
        """
        try:
            return self._extract_content(pdf_path)
        except Exception as e:
            return {
                "Balance Sheet": [],
                "Profit and Loss": [],
                "warning": f"Could not read this file: {str(e)}"
            }

    def _extract_content(self, pdf_path: str) -> Dict:
        all_records = []

        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    try:
                        text = page.extract_text()
                        if text:
                            records = self._extract_from_text(text)
                            all_records.extend(records)
                    except Exception:
                        # Skip unreadable pages silently
                        continue
        except Exception as e:
            return {
                "Balance Sheet": [],
                "Profit and Loss": [],
                "warning": f"Could not open PDF: {str(e)}"
            }

        if not all_records:
            return {
                "Balance Sheet": [],
                "Profit and Loss": [],
                "warning": (
                    "No readable financial data found. "
                    "This document may contain scanned images or unsupported formatting."
                )
            }

        # De-duplicate by description (keep first occurrence)
        seen = set()
        unique_records = []
        for r in all_records:
            key = r["Description"].strip().lower()
            if key not in seen:
                seen.add(key)
                unique_records.append({"Description": r["Description"], "Value": r["Value"]})

        # Return same data for both sheets so the UI always has content
        return {
            "Balance Sheet": unique_records,
            "Profit and Loss": unique_records,
        }

    def _extract_from_text(self, text: str) -> List[Dict]:
        """
        Line-by-line extraction.
        Accepts any line that has BOTH text and a numeric value at the end.
        """
        records = []
        # Matches: anything (description), then whitespace, then a number (possibly with commas, parens, dashes)
        regex = re.compile(r"^(.*?)\s+([-$()0-9][0-9,.()\s$-]*)$")

        for raw_line in text.split("\n"):
            line = raw_line.strip()
            if not line:
                continue

            match = regex.match(line)
            if not match:
                continue

            description = match.group(1).strip()
            value_raw = match.group(2).strip()

            # Description must contain at least one letter
            if not re.search(r"[A-Za-z]", description):
                continue

            # Value must be parseable as a number
            if not self._is_numeric(value_raw):
                continue

            records.append({
                "Description": description,
                "Value": value_raw,
                "Year": "Latest"
            })

        return records

    def _is_numeric(self, s: str) -> bool:
        if not s:
            return False
        # Normalize: remove currency symbols, commas, parentheses (negatives), spaces
        cleaned = re.sub(r"[$,\s]", "", s)
        cleaned = cleaned.replace("(", "-").replace(")", "")
        try:
            float(cleaned)
            return True
        except ValueError:
            return False

    def _save_to_excel(self, data_dict: Dict, output_dir: str) -> str:
        filename = "Financial_Statement_Extracted.xlsx"
        output_path = os.path.join(output_dir, filename)

        with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
            for sheet_name in ["Balance Sheet", "Profit and Loss"]:
                rows = data_dict.get(sheet_name, [])
                df = pd.DataFrame(rows) if rows else pd.DataFrame(columns=["Description", "Value"])
                df = df[["Description", "Value"]] if not df.empty else df
                df.to_excel(writer, sheet_name=sheet_name, index=False)

        return output_path
