// POS Awesome Layout Fixes - v1.0
// Ensures proper alignment and layout of main POS interface

console.log('POS Awesome: Layout fixes script loaded');

// Function to apply layout fixes
var applyLayoutFixes = function () {
	// Fix main POS container
	var posContainer = document.querySelector('.pos-main-container');
	if (posContainer) {
		posContainer.style.display = 'flex';
		posContainer.style.flexDirection = 'column';
		posContainer.style.width = '100%';
		posContainer.style.height = '100vh';
		posContainer.style.overflow = 'hidden';
	}

	// Fix dynamic main row
	var mainRow = document.querySelector('.dynamic-main-row');
	if (mainRow) {
		mainRow.style.display = 'flex';
		mainRow.style.flexWrap = 'wrap';
		mainRow.style.width = '100%';
		mainRow.style.height = 'calc(100vh - 64px)';
		mainRow.style.overflow = 'hidden';
		mainRow.style.padding = '0';
		mainRow.style.margin = '0';
	}

	// Fix dynamic columns with specific widths (left 33%, right 67%)
var cols = document.querySelectorAll('.dynamic-col');
for (var i = 0; i < cols.length; i++) {
    cols[i].style.overflow = 'hidden';
    cols[i].style.padding = '0';
    if (i === 0) {
        cols[i].style.flex = '0 0 33.333%';
        cols[i].style.maxWidth = '33.333%';
    }
    if (i === 1) {
        cols[i].style.flex = '0 0 66.666%';
        cols[i].style.maxWidth = '66.666%';
    }
}

	// Fix items group panel (sidebar)
	var itemsPanel = document.querySelector('.items-group-panel');
	if (itemsPanel) {
		itemsPanel.style.overflowY = 'auto';
		itemsPanel.style.overflowX = 'hidden';
		itemsPanel.style.padding = '12px';
	}

	// Fix main content area
	var mainContent = document.querySelector('.v-main');
	if (mainContent) {
		mainContent.style.overflow = 'hidden';
		mainContent.style.width = '100%';
	}

	// Fix main wrap
	var mainWrap = document.querySelector('.v-main__wrap');
	if (mainWrap) {
		mainWrap.style.display = 'flex';
		mainWrap.style.flexDirection = 'column';
		mainWrap.style.width = '100%';
		mainWrap.style.height = '100%';
	}

	// Fix tables
	var tables = document.querySelectorAll('.v-table, table');
	for (var j = 0; j < tables.length; j++) {
		tables[j].style.width = '100%';
		tables[j].style.maxWidth = '100%';
		tables[j].style.tableLayout = 'auto';
	}

	// Fix cards
	var cards = document.querySelectorAll('.v-card');
	for (var k = 0; k < cards.length; k++) {
		cards[k].style.display = 'flex';
		cards[k].style.flexDirection = 'column';
	}

	// Fix form fields
	var fields = document.querySelectorAll('.v-field');
	for (var l = 0; l < fields.length; l++) {
		fields[l].style.width = '100%';
		fields[l].style.maxWidth = '100%';
	}

	// Fix input fields
	var inputs = document.querySelectorAll('input[type="number"], input[type="text"], input[type="search"]');
	for (var m = 0; m < inputs.length; m++) {
		inputs[m].style.width = '100%';
		inputs[m].style.boxSizing = 'border-box';
	}
};

// Apply fixes with reduced frequency to prevent performance issues
var isFixing = false;
var applyLayoutFixesSafe = function () {
	if (isFixing) return;
	isFixing = true;
	try {
		applyLayoutFixes();
	} finally {
		setTimeout(function () {
			isFixing = false;
		}, 100);
	}
};

// Apply fixes on load
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', applyLayoutFixesSafe);
} else {
	applyLayoutFixesSafe();
}

// Apply on window load
window.addEventListener('load', applyLayoutFixesSafe);

// Reduced frequency interval
setInterval(applyLayoutFixesSafe, 5000);

console.log('POS Awesome: Layout fixes initialized');
