import { IRouteType } from "@/models/route-type";

const dashboardRoutes: IRouteType[] = [
  {
    path: "/dashboard",
    component: () =>
      import(
        /* webpackChunkName: "base-layout" */ "@/modules/dashboard/layouts/dashboard-layout.vue"
      ),
    children: [
      {
        path: "",
        name: "Dashboard",
        component: () =>
          import(
            /* webpackChunkName: "dashboard-module" */ "@/modules/dashboard/pages/dashboard.vue"
          ),
        meta: {
          requiresAuth: true,
          title: "Dashboard",
          pageMeta: {
            title: "Dashboard",
            description: "CISL Dashboard",
          },
        },
      },
      {
        path: "/invoice-imports",
        name: "InvoiceImports",
        component: () =>
          import(
            /* webpackChunkName: "dashboard-module" */ "@/modules/dashboard/pages/invoice-irn.vue"
          ),
        meta: {
          requiresAuth: true,
          title: "Invoice IRN",
          pageMeta: {
            title: "Invoice IRN",
            description: "CISL Invoice IRN",
          },
        },
      },
      {
        path: "/invoice-compliance",
        component: () =>
          import(
            /* webpackChunkName: "dashboard-module" */ "@/modules/dashboard/layouts/invoice-compliance-layout.vue"
          ),
        children: [
          {
            path: "valid",
            name: "ValidInvoiceCompliance",
            component: () =>
              import("@/modules/dashboard/pages/invoice-compliance-valid.vue"),
            meta: {
              requiresAuth: true,
              title: "Invoice Compliance",
              pageMeta: {
                title: "Invoice Compliance",
                description: "CISL Invoice Compliance",
              },
            },
          },
          {
            path: "invalid",
            name: "InvalidInvoiceCompliance",
            component: () =>
              import(
                "@/modules/dashboard/pages/invoice-compliance-invalid.vue"
              ),
            meta: {
              requiresAuth: true,
              title: "Invoice Compliance",
              pageMeta: {
                title: "Invoice Compliance",
                description: "CISL Invoice Compliance",
              },
            },
          },
        ],
      },

      {
        path: "/view-invoice/:invoice_id",
        name: "InvoiceDetailPDF",
        component: () =>
          import(
            /* webpackChunkName: "dashboard-module" */ "@/modules/dashboard/pages/invoice-detail-pdf.vue"
          ),
        meta: {
          requiresAuth: true,
          title: "Invoice Detail PDF",
          pageMeta: {
            title: "Invoice Detail PDF",
            description: "CISL Invoice Detail PDF",
          },
        },
      },

      // {
      //   path: "/invoice-tracker",
      //   name: "InvoiceTracker",
      //   component: () =>
      //     import(
      //       /* webpackChunkName: "dashboard-module" */ "@/modules/dashboard/pages/invoice-tracker.vue"
      //     ),
      //   meta: {
      //     requiresAuth: true,
      //     title: "Invoice Tracker",
      //     pageMeta: {
      //       title: "Invoice Tracker",
      //       description: "CISL Invoice Tracker",
      //     },
      //   },
      // },

      {
        path: "/invoice-tracker",
        component: () =>
          import(
            /* webpackChunkName: "dashboard-module" */ "@/modules/dashboard/layouts/invoice-tracker-layout.vue"
          ),
        children: [
          {
            path: "outgoing",
            name: "InvoiceTrackerOutgoing",
            component: () =>
              import("@/modules/dashboard/pages/invoice-tracker-outgoing.vue"),
            meta: {
              requiresAuth: true,
              title: "Outgoing Invoice",
              pageMeta: {
                title: "Outgoing Invoice",
                description: "CISL Outgoing Invoice",
              },
            },
          },
          {
            path: "incoming",
            name: "InvoiceTrackerIncoming",
            component: () =>
              import("@/modules/dashboard/pages/invoice-tracker-incoming.vue"),
            meta: {
              requiresAuth: true,
              title: "Incoming Invoice",
              pageMeta: {
                title: "Incoming Invoice",
                description: "CISL Incoming Invoice",
              },
            },
          },
        ],
      },

      {
        path: "/activity-logs",
        name: "ActivityLogs",
        component: () =>
          import(
            /* webpackChunkName: "dashboard-module" */ "@/modules/dashboard/pages/activity-logs.vue"
          ),
        meta: {
          requiresAuth: true,
          title: "Activity Logs",
          pageMeta: {
            title: "Activity Logs",
            description: "CISL Activity Logs",
          },
        },
      },
    ],
  },
];

export default dashboardRoutes;
