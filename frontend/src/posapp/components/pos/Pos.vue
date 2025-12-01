<template>
	<div
		class="pos-main-container dynamic-container"
		:class="rtlClasses"
		:style="[responsiveStyles, rtlStyles]"
	>
		<ClosingDialog></ClosingDialog>
		<Drafts></Drafts>
		<SalesOrders></SalesOrders>
		<Returns></Returns>
		<NewAddress></NewAddress>
		<MpesaPayments></MpesaPayments>
		<Variants></Variants>
		<OpeningDialog v-if="dialog" :dialog="dialog"></OpeningDialog>
		<v-row v-show="!dialog" dense class="ma-0 dynamic-main-row">
			<!-- Collapsible Item Groups Sidebar -->
			<v-navigation-drawer
				v-model="itemGroupsDrawer"
				:width="itemGroupsDrawerWidth"
				location="left"
				temporary
				class="item-groups-sidebar"
			>
				<v-list density="compact" class="pa-0">
					<v-list-item class="sidebar-header">
						<v-list-item-title class="text-h6 font-weight-bold">{{
							__("Item Groups")
						}}</v-list-item-title>
						<template v-slot:append>
							<v-btn
								icon="mdi-close"
								variant="text"
								size="small"
								@click="itemGroupsDrawer = false"
							></v-btn>
						</template>
					</v-list-item>
					<v-divider></v-divider>
					<v-list-item
						v-for="group in itemGroups"
						:key="group"
						@click="selectItemGroup(group)"
						:active="selectedItemGroup === group"
						class="group-item"
					>
						<v-list-item-title>{{ group }}</v-list-item-title>
					</v-list-item>
				</v-list>
			</v-navigation-drawer>

			<v-col
				v-show="!payment && !showOffers && !coupons"
				xl="7"
				lg="7"
				md="7"
				sm="12"
				cols="12"
				class="pos dynamic-col"
			>
				<ItemsSelector></ItemsSelector>
			</v-col>
			<v-col v-show="showOffers" xl="7" lg="7" md="7" sm="12" cols="12" class="pos dynamic-col">
				<PosOffers></PosOffers>
			</v-col>
			<v-col v-show="coupons" xl="7" lg="7" md="7" sm="12" cols="12" class="pos dynamic-col">
				<PosCoupons></PosCoupons>
			</v-col>
			<v-col v-show="payment" xl="7" lg="7" md="7" sm="12" cols="12" class="pos dynamic-col">
				<Payments></Payments>
			</v-col>

			<v-col xl="5" lg="5" md="5" sm="12" cols="12" class="pos dynamic-col">
				<Invoice></Invoice>
			</v-col>
		</v-row>
	</div>
</template>

<script>
import ItemsSelector from "./ItemsSelector.vue";
import Invoice from "./Invoice.vue";
import OpeningDialog from "./OpeningDialog.vue";
import Payments from "./Payments.vue";
import PosOffers from "./PosOffers.vue";
import PosCoupons from "./PosCoupons.vue";
import Drafts from "./Drafts.vue";
import SalesOrders from "./SalesOrders.vue";
import ClosingDialog from "./ClosingDialog.vue";
import NewAddress from "./NewAddress.vue";
import Variants from "./Variants.vue";
import Returns from "./Returns.vue";
import MpesaPayments from "./Mpesa-Payments.vue";
import {
	getOpeningStorage,
	setOpeningStorage,
	clearOpeningStorage,
	initPromise,
	checkDbHealth,
	setTaxTemplate,
} from "../../../offline/index.js";
import { getCurrentInstance } from "vue";
import { usePosShift } from "../../composables/usePosShift.js";
import { useOffers } from "../../composables/useOffers.js";
// Import the cache cleanup function
import { clearExpiredCustomerBalances } from "../../../offline/index.js";
import { useResponsive } from "../../composables/useResponsive.js";
import { useRtl } from "../../composables/useRtl.js";
import { useCustomersStore } from "../../stores/customersStore.js";
import { storeToRefs } from "pinia";

export default {
	setup() {
		const instance = getCurrentInstance();
		const responsive = useResponsive();
		const rtl = useRtl();
		const shift = usePosShift(() => {
			if (instance && instance.proxy) {
				instance.proxy.dialog = true;
			}
		});
		const offers = useOffers();
		return { ...responsive, ...rtl, ...shift, ...offers };
	},
	data: function () {
		return {
			dialog: false,

			payment: false,
			showOffers: false,
			coupons: false,
			itemsLoaded: false,
			customersLoaded: false,
			itemGroupsDrawer: false,
			itemGroupsDrawerWidth: 280,
			itemGroups: [],
			selectedItemGroup: "ALL",
		};
	},

	components: {
		ItemsSelector,
		Invoice,
		OpeningDialog,
		Payments,
		Drafts,
		ClosingDialog,

		Returns,
		PosOffers,
		PosCoupons,
		NewAddress,
		Variants,
		MpesaPayments,
		SalesOrders,
	},

	methods: {
		create_opening_voucher() {
			this.dialog = true;
		},
		get_pos_setting() {
			frappe.db.get_doc("POS Settings", undefined).then((doc) => {
				this.eventBus.emit("set_pos_settings", doc);
			});
		},
		checkLoadingComplete() {
			if (this.itemsLoaded && this.customersLoaded) {
				console.info("Loading completed");
			}
		},
		selectItemGroup(group) {
			this.selectedItemGroup = group;
			this.eventBus.emit("set_item_group", group);
			this.itemGroupsDrawer = false;
		},
	},

	mounted: function () {
		this.$nextTick(function () {
			this.check_opening_entry();
			this.get_pos_setting();
			this.eventBus.on("close_opening_dialog", () => {
				this.dialog = false;
			});
			this.eventBus.on("register_pos_data", (data) => {
				this.pos_profile = data.pos_profile;
				this.get_offers(this.pos_profile.name, this.pos_profile);
				this.pos_opening_shift = data.pos_opening_shift;
				this.eventBus.emit("register_pos_profile", data);
				console.info("LoadPosProfile");
			});
			// When profile is registered directly from composables,
			// ensure offers are fetched as well
			this.eventBus.on("register_pos_profile", (data) => {
				if (data && data.pos_profile) {
					this.get_offers(data.pos_profile.name, data.pos_profile);
				}
			});
			this.eventBus.on("show_payment", (data) => {
				this.payment = data === "true";
				this.showOffers = false;
				this.coupons = false;
			});
			this.eventBus.on("show_offers", (data) => {
				this.showOffers = data === "true";
				this.payment = false;
				this.coupons = false;
			});
			this.eventBus.on("show_coupons", (data) => {
				this.coupons = data === "true";
				this.showOffers = false;
				this.payment = false;
			});
			this.eventBus.on("open_closing_dialog", () => {
				this.get_closing_data();
			});
			this.eventBus.on("submit_closing_pos", (data) => {
				this.submit_closing_pos(data);
			});

			this.eventBus.on("items_loaded", () => {
				this.itemsLoaded = true;
				this.checkLoadingComplete();
			});
			this.eventBus.on("toggle_item_groups_drawer", (data) => {
				console.log("[Pos] toggle_item_groups_drawer event received:", data);
				this.itemGroupsDrawer = data === true || data === "true";
				console.log("[Pos] itemGroupsDrawer set to:", this.itemGroupsDrawer);
			});
			this.eventBus.on("update_item_groups", (groups) => {
				console.log("[Pos] update_item_groups event received:", groups);
				this.itemGroups = groups || [];
				console.log("[Pos] itemGroups set to:", this.itemGroups);
			});
			this.eventBus.on("update_selected_item_group", (group) => {
				console.log("[Pos] update_selected_item_group event received:", group);
				this.selectedItemGroup = group || "ALL";
			});
		});
	},
	beforeUnmount() {
		this.eventBus.off("close_opening_dialog");
		this.eventBus.off("register_pos_data");
		this.eventBus.off("register_pos_profile");
		this.eventBus.off("LoadPosProfile");
		this.eventBus.off("show_offers");
		this.eventBus.off("show_coupons");
		this.eventBus.off("open_closing_dialog");
		this.eventBus.off("submit_closing_pos");
		this.eventBus.off("items_loaded");
		this.eventBus.off("toggle_item_groups_drawer");
		this.eventBus.off("update_item_groups");
		this.eventBus.off("update_selected_item_group");
	},
	// In the created() or mounted() lifecycle hook
	created() {
		// Clean up expired customer balance cache on POS load
		clearExpiredCustomerBalances();
		const customersStore = useCustomersStore();
		const { customersLoaded } = storeToRefs(customersStore);
		this.$watch(
			() => customersLoaded.value,
			(value) => {
				if (value) {
					this.customersLoaded = true;
					this.checkLoadingComplete();
				}
			},
			{ immediate: true },
		);
	},
};
</script>

<style scoped>
.dynamic-container {
	/* add space for the navbar with better spacing */
	/*padding-top: calc(25px + var(--dynamic-lg));*/
	/* Navbar height (25px) + larger spacing */
	transition: all 0.3s ease;
}

.dynamic-main-row {
	padding: 0;
	margin: 0;
}

.dynamic-col {
	padding: var(--dynamic-sm);
	transition: padding 0.3s ease;
	margin-top: var(--dynamic-sm);
	/* Add top margin for better separation */
}

@media (max-width: 768px) {
	.dynamic-container {
		padding-top: calc(56px + var(--dynamic-md));
		/* Consistent navbar height + medium spacing */
	}

	.dynamic-col {
		padding: var(--dynamic-xs);
		margin-top: var(--dynamic-xs);
	}
}

/* Item Groups Sidebar Styling */
.item-groups-sidebar {
	z-index: 1100 !important;
	box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
	background-color: var(--pos-card-bg) !important;
}

.item-groups-sidebar .sidebar-header {
	background-color: var(--pos-surface-primary);
	border-bottom: 1px solid var(--pos-border);
}

.item-groups-sidebar :deep(.v-list-item-title) {
	color: var(--pos-text-primary);
}

.item-groups-sidebar .group-item {
	cursor: pointer;
	transition: background-color 0.2s ease;
}

.item-groups-sidebar .group-item:hover {
	background-color: rgba(25, 118, 210, 0.1);
}

.item-groups-sidebar .group-item.v-list-item--active {
	background-color: rgba(25, 118, 210, 0.2);
	border-left: 3px solid var(--v-theme-primary);
}
</style>
