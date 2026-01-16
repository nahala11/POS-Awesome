"""Stock-related utility functions for POS Awesome."""

import frappe


@frappe.whitelist()
def clear_stock_cache():
	"""Clear Redis cache for stock quantities.
	
	This should be called after stock reconciliation or any bulk stock update
	to ensure POS Awesome shows the latest stock quantities.
	"""
	try:
		# Clear redis cache
		frappe.cache().delete_keys("*_fetch_bin_qty*")
		frappe.cache().delete_keys("*get_bin_qty*")
		
		return {"message": "Stock cache cleared successfully"}
	except Exception as e:
		frappe.log_error(f"Failed to clear stock cache: {str(e)}")
		return {"message": "Failed to clear stock cache", "error": str(e)}


def on_stock_reconciliation_submit(doc, method):
	"""Hook to clear stock cache when Stock Reconciliation is submitted."""
	clear_stock_cache()
	frappe.msgprint("Stock cache cleared. Please reload items in POS to see updated quantities.")


def on_stock_entry_submit(doc, method):
	"""Hook to clear stock cache when Stock Entry is submitted."""
	clear_stock_cache()
