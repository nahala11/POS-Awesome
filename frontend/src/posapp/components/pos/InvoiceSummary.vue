<template>
	<v-card
		class="cards mb-0 mt-3 py-2 px-3 rounded-lg resizable pos-themed-card"
		style="resize: vertical; overflow: auto"
	>
		<v-row dense>
			<!-- Summary Info -->
			<v-col cols="12" md="7">
				<v-row dense>
					<!-- Total Qty -->
					<v-col cols="12">
						<v-text-field
							:model-value="formatFloat(total_qty, hide_qty_decimals ? 0 : undefined)"
							:label="frappe._('Total Qty')"
							prepend-inner-icon="mdi-format-list-numbered"
							variant="solo"
							density="compact"
							readonly
							color="accent"
						/>
					</v-col>
					
					<!-- Total -->
					<v-col cols="12">
						<v-text-field
							:model-value="formatCurrency(subtotal)"
							:prefix="currencySymbol(displayCurrency)"
							:label="frappe._('Total')"
							prepend-inner-icon="mdi-cash"
							variant="solo"
							density="compact"
							readonly
							color="success"
							class="summary-field"
						/>
					</v-col>
				</v-row>
			</v-col>

			<!-- Action Buttons -->
			<v-col cols="12" md="5">
				<v-row dense>
					<v-col cols="6">
						<v-btn
							block
							color="accent"
							theme="dark"
							@click="handleSaveAndClear"
							class="summary-btn compact-btn"
							:loading="saveLoading"
							size="small"
						>
							{{ __("SAVE & CLEAR") }}
						</v-btn>
					</v-col>
					<v-col cols="6">
						<v-btn
							block
							color="warning"
							theme="dark"
							@click="handleLoadDrafts"
							class="white-text-btn summary-btn compact-btn"
							:loading="loadDraftsLoading"
							size="small"
						>
							{{ __("LOAD DRAFTS") }}
						</v-btn>
					</v-col>
					<v-col cols="6" v-if="pos_profile.custom_allow_select_sales_order == 1">
						<v-btn
							block
							color="info"
							theme="dark"
							@click="handleSelectOrder"
							class="summary-btn compact-btn"
							:loading="selectOrderLoading"
							size="small"
						>
							{{ __("SELECT S.O") }}
						</v-btn>
					</v-col>
					<v-col cols="6">
						<v-btn
							block
							color="error"
							theme="dark"
							@click="handleCancelSale"
							class="summary-btn compact-btn"
							:loading="cancelLoading"
							size="small"
						>
							{{ __("CANCEL SALE") }}
						</v-btn>
					</v-col>
					<v-col cols="6" v-if="pos_profile.posa_allow_return == 1">
						<v-btn
							block
							color="secondary"
							theme="dark"
							@click="handleOpenReturns"
							class="summary-btn compact-btn"
							:loading="returnsLoading"
							size="small"
						>
							{{ __("SALES RETURN") }}
						</v-btn>
					</v-col>
					<v-col cols="6" v-if="pos_profile.posa_allow_print_draft_invoices">
						<v-btn
							block
							color="primary"
							theme="dark"
							@click="handlePrintDraft"
							class="summary-btn compact-btn"
							:loading="printLoading"
							size="small"
						>
							{{ __("PRINT DRAFT") }}
						</v-btn>
					</v-col>
					<!-- Apply Offers button hidden -->
					<!-- <v-col cols="6">
						<v-btn
							block
							color="info"
							theme="dark"
							prepend-icon="mdi-tag"
							@click="handleApplyOffers"
							class="summary-btn"
							:loading="applyOffersLoading"
						>
							{{ __("Apply Offers") }}
						</v-btn>
					</v-col> -->
					<v-col cols="12">
						<v-btn
							block
							color="success"
							theme="dark"
							size="large"
							prepend-icon="mdi-credit-card"
							@click="handleShowPayment"
							class="summary-btn pay-btn"
							:loading="paymentLoading"
						>
							{{ __("PAY") }}
						</v-btn>
					</v-col>
				</v-row>
			</v-col>
		</v-row>
	</v-card>
</template>

<script>
export default {
	props: {
		pos_profile: Object,
		total_qty: [Number, String],
		additional_discount: Number,
		additional_discount_percentage: Number,
		total_items_discount_amount: Number,
		subtotal: Number,
		displayCurrency: String,
		formatFloat: Function,
		formatCurrency: Function,
		currencySymbol: Function,
		discount_percentage_offer_name: [String, Number],
		isNumber: Function,
	},
	data() {
		return {
			// Loading states for better UX
			saveLoading: false,
			loadDraftsLoading: false,
			selectOrderLoading: false,
			cancelLoading: false,
			returnsLoading: false,
			printLoading: false,
			applyOffersLoading: false,
			paymentLoading: false,
		};
	},
	emits: [
		"update:additional_discount",
		"update:additional_discount_percentage",
		"update_discount_umount",
		"save-and-clear",
		"load-drafts",
		"select-order",
		"cancel-sale",
		"open-returns",
		"print-draft",
		"apply-offers",
		"show-payment",
	],
	computed: {
		hide_qty_decimals() {
			try {
				const saved = localStorage.getItem("posawesome_item_selector_settings");
				if (saved) {
					const opts = JSON.parse(saved);
					return !!opts.hide_qty_decimals;
				}
			} catch (e) {
				console.error("Failed to load item selector settings:", e);
			}
			return false;
		},
	},
	methods: {
		// Debounced handlers for better performance
		handleAdditionalDiscountUpdate(value) {
			this.$emit("update:additional_discount", value);
		},

		handleAdditionalDiscountPercentageUpdate(value) {
			this.$emit("update:additional_discount_percentage", value);
		},

		async handleSaveAndClear() {
			this.saveLoading = true;
			try {
				await this.$emit("save-and-clear");
			} finally {
				this.saveLoading = false;
			}
		},

		async handleLoadDrafts() {
			this.loadDraftsLoading = true;
			try {
				await this.$emit("load-drafts");
			} finally {
				this.loadDraftsLoading = false;
			}
		},

		async handleSelectOrder() {
			this.selectOrderLoading = true;
			try {
				await this.$emit("select-order");
			} finally {
				this.selectOrderLoading = false;
			}
		},

		async handleCancelSale() {
			this.cancelLoading = true;
			try {
				await this.$emit("cancel-sale");
			} finally {
				this.cancelLoading = false;
			}
		},

		async handleOpenReturns() {
			this.returnsLoading = true;
			try {
				await this.$emit("open-returns");
			} finally {
				this.returnsLoading = false;
			}
		},

		async handlePrintDraft() {
			this.printLoading = true;
			try {
				await this.$emit("print-draft");
			} finally {
				this.printLoading = false;
			}
		},

		async handleApplyOffers() {
			this.applyOffersLoading = true;
			try {
				await this.$emit("apply-offers");
			} finally {
				this.applyOffersLoading = false;
			}
		},

		async handleShowPayment() {
			this.paymentLoading = true;
			try {
				await this.$emit("show-payment");
			} finally {
				this.paymentLoading = false;
			}
		},
	},
};
</script>

<style scoped>
.cards {
	background-color: var(--pos-card-bg) !important;
	transition: all 0.3s ease;
}

.white-text-btn {
	color: var(--pos-text-primary) !important;
}

.white-text-btn :deep(.v-btn__content) {
	color: var(--pos-text-primary) !important;
}

/* Enhanced button styling with better performance */
.summary-btn {
	transition: all 0.2s ease !important;
	position: relative;
	overflow: hidden;
}

/* Compact button styling for narrower layout */
.compact-btn {
	font-size: 0.75rem !important;
	padding: 6px 8px !important;
	min-height: 32px !important;
	height: auto !important;
	letter-spacing: 0.02em !important;
	font-weight: 600 !important;
}

.compact-btn :deep(.v-btn__content) {
	white-space: nowrap !important;
	overflow: hidden !important;
	text-overflow: ellipsis !important;
	line-height: 1.2 !important;
}

.summary-btn :deep(.v-btn__content) {
	white-space: normal !important;
	transition: all 0.2s ease;
}

.summary-btn:hover {
	transform: translateY(-1px);
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
}

.summary-btn:active {
	transform: translateY(0);
}

/* Special styling for the PAY button */
.pay-btn {
	font-weight: 600 !important;
	font-size: 1.1rem !important;
	background: linear-gradient(135deg, #4caf50, #45a049) !important;
	box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3) !important;
}

.pay-btn:hover {
	background: linear-gradient(135deg, #45a049, #3d8b40) !important;
	box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4) !important;
	transform: translateY(-2px);
}

/* Enhanced field styling */
.summary-field {
	transition: all 0.2s ease;
}

.summary-field:hover {
	transform: translateY(-1px);
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Responsive optimizations */
@media (max-width: 768px) {
	.summary-btn {
		font-size: 0.875rem !important;
		padding: 8px 12px !important;
	}

	.pay-btn {
		font-size: 1rem !important;
	}

	.summary-field {
		font-size: 0.875rem;
	}
}

@media (max-width: 480px) {
	.summary-btn {
		font-size: 0.8rem !important;
		padding: 6px 8px !important;
	}

	.pay-btn {
		font-size: 0.95rem !important;
	}
}

/* Loading state animations */
.summary-btn:deep(.v-btn__loader) {
	opacity: 0.8;
}

/* Dark theme enhancements */
:deep([data-theme="dark"]) .summary-btn,
:deep(.v-theme--dark) .summary-btn {
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

:deep([data-theme="dark"]) .summary-btn:hover,
:deep(.v-theme--dark) .summary-btn:hover {
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
}
</style>
