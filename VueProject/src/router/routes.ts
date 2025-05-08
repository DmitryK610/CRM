import type { RouteRecordRaw } from 'vue-router'

import ClientForm from '@/components/clients/ClientForm.vue'
import OrderEditor from '@/components/orders/OrderEditor.vue'
import MaterialEditor from '@/components/materials/MaterialEditor.vue'

const LoginView = () => import('@/views/LoginView.vue')
const DashboardView = () => import('@/views/DashboardView.vue')
const OrdersView = () => import('@/views/OrdersView.vue')
const ClientsView = () => import('@/views/ClientsView.vue')
const ClientDetailView = () => import('@/views/ClientDetailView.vue')
const CalculationsView = () => import('@/views/CalculationsView.vue')
const CalculationDetailView = () => import('@/views/CalculationDetailView.vue')
const MaterialsView = () => import('@/views/MaterialsView.vue')
const SuppliersView = () => import('@/views/SuppliersView.vue')
const EmployeesView = () => import('@/views/EmployeesView.vue')
const FinancialView = () => import('@/views/FinancialView.vue')
const NotFoundView = () => import('@/views/NotFoundView.vue')

const MaterialPurchaseFormView = () => import('@/components/materials/MaterialStock.vue')
const MaterialPurchaseDetails = () => import('@/components/materials/MaterialPurchaseDetails.vue')

export const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { hideHeader: true, requiresAuth: false },
  },
  {
    path: '/',
    redirect: '/dashboard',
    meta: { requiresAuth: true },

    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardView,
      },
      {
        path: 'orders',
        name: 'OrdersList',
        component: OrdersView,
      },
      {
        path: 'orders/create',
        name: 'OrderCreate',
        component: OrderEditor,
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('@/components/orders/OrderDetailView.vue'),
        props: true,
      },
      {
        path: 'orders/:id/edit',
        name: 'OrderEdit',
        component: OrderEditor,
        props: true, //
      },
      {
        path: 'clients',
        name: 'ClientsList',
        component: ClientsView,
      },
      {
        path: 'clients/add',
        name: 'AddClient',
        component: ClientForm,
      },
      {
        path: 'clients/:id/edit',
        name: 'EditClient',
        component: ClientForm,
        props: true,
      },
      {
        path: 'clients/:id',
        name: 'ClientDetail',
        component: ClientDetailView,
        props: true,
      },
      {
        path: 'calculations',
        name: 'CalculationsList',
        component: CalculationsView,
      },
      {
        path: 'calculations/:id',
        name: 'CalculationDetail',
        component: CalculationDetailView,
        props: true,
      },
      {
        path: 'materials',
        name: 'MaterialsView',
        component: MaterialsView,
      },
      {
        path: 'materials/add',
        name: 'MaterialAdd',
        component: MaterialEditor,
      },
      {
        path: 'materials/:id/edit',
        name: 'MaterialEdit',
        component: MaterialEditor,
        props: true,
      },

      {
        path: 'material-purchases/add',
        name: 'AddMaterialPurchaseView',
        component: MaterialPurchaseFormView,
      },
      {
        path: 'material-purchases/:id/edit',
        name: 'EditMaterialPurchaseView',
        component: MaterialPurchaseFormView,
      },
      {
        path: 'material-purchases/:id',
        name: 'MaterialPurchaseDetails',
        component: MaterialPurchaseDetails,
        props: true,
      },

      {
        path: 'suppliers',
        name: 'SuppliersList',
        component: SuppliersView,
      },

      {
        path: 'employees',
        name: 'EmployeesList',
        component: EmployeesView,
      },

      {
        path: 'financial',
        name: 'Financial',
        component: FinancialView,
      },
    ],
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
    meta: { requiresAuth: false },
  },
]
