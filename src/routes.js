// import
import React, { Component }  from 'react';
import Dashboard from "views/Dashboard/Dashboard.js";
import Tables from "views/Dashboard/Tables.js";
import Billing from "views/Dashboard/Billing.js";
import RTLPage from "views/RTL/RTLPage.js";
import Profile from "views/Dashboard/Profile.js";
import SignIn from "views/Pages/SignIn.js";
import SignUp from "views/Pages/SignUp.js";
import ResetPassword from "views/Pages/ResetPassword.js";
import RegisterUser from "views/Users/RegisterUser.js";
import ListUsers from "views/Users/ListUsers.js";
import ChangePassword from "views/Users/ChangePassword.js";
import UserInfo from "views/Users/UserInfo.js";
import RegisterRole from "views/Roles/RegisterRole.js";
import ListRoles from "views/Roles/ListRoles.js";
import RegisterGroup from "views/Roles/RegisterGroup.js";
import ListGroups from "views/Roles/ListGroups.js";
import RegisterProduct from "views/Products/RegisterProduct.js";
import ListProducts from "views/Products/ListProducts.js";
import SupplyEntry from "views/Products/SupplyEntry.js";
import StockControl from "views/Products/StockControl.js";
import RegisterPromotion from "views/Promotions/RegisterPromotion.js";
import ListPromotions from "views/Promotions/ListPromotions.js";
import RegisterSupplier from "views/Suppliers/RegisterSupplier.js";
import ListSuppliers from "views/Suppliers/ListSuppliers.js";
import RegisterPayment from "views/Payments/RegisterPayment.js";
import PaymentMethods from "views/Payments/PaymentMethods.js";
import ActivityLog from "views/Settings/ActivityLog.js";
import Logout from "views/Settings/Logout.js";

import {
  HomeIcon,
  StatsIcon,
  CreditIcon,
  PersonIcon,
  DocumentIcon,
  RocketIcon,
  SupportIcon,
} from "components/Icons/Icons";

var dashRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    rtlName: "لوحة القيادة",
    icon: <HomeIcon color='inherit' />,
    component: Dashboard,
    layout: "/admin",
  },
  {
    path: "/tables",
    name: "Tables",
    rtlName: "لوحة القيادة",
    icon: <StatsIcon color='inherit' />,
    component: Tables,
    layout: "/admin",
  },
  {
    path: "/billing",
    name: "Billing",
    rtlName: "لوحة القيادة",
    icon: <CreditIcon color='inherit' />,
    component: Billing,
    layout: "/admin",
  },
  {
    path: "/rtl-support-page",
    name: "RTL",
    rtlName: "آرتيإل",
    icon: <SupportIcon color='inherit' />,
    component: RTLPage,
    layout: "/rtl",
  },
  {
    name: "Usuarios",
    category: "users",
    rtlName: "المستخدمون",
    state: "usersCollapse",
    icon: <PersonIcon color='inherit' />,
    views: [
      {
        path: "/register-user",
        name: "Registrar Usuario",
        rtlName: "تسجيل المستخدم",
        icon: <PersonIcon color='inherit' />,
        component: RegisterUser,
        layout: "/admin",
      },
      {
        path: "/list-users",
        name: "Listar Usuarios",
        rtlName: "قائمة المستخدمين",
        icon: <PersonIcon color='inherit' />,
        component: ListUsers,
        layout: "/admin",
      },
      {
        path: "/change-password",
        name: "Cambiar Contraseña",
        rtlName: "تغيير كلمة المرور",
        icon: <DocumentIcon color='inherit' />,
        component: ChangePassword,
        layout: "/admin",
      },
      {
        path: "/user-info",
        name: "Información Usuarios",
        rtlName: "معلومات المستخدمين",
        icon: <StatsIcon color='inherit' />,
        component: UserInfo,
        layout: "/admin",
      },
    ],
  },
  {
    name: "Roles y Grupos",
    category: "roles",
    rtlName: "الأدوار والمجموعات",
    state: "rolesCollapse",
    icon: <DocumentIcon color='inherit' />,
    views: [
      {
        path: "/register-role",
        name: "Registrar Rol",
        rtlName: "تسجيل الدور",
        icon: <DocumentIcon color='inherit' />,
        component: RegisterRole,
        layout: "/admin",
      },
      {
        path: "/list-roles",
        name: "Listar Roles",
        rtlName: "قائمة الأدوار",
        icon: <DocumentIcon color='inherit' />,
        component: ListRoles,
        layout: "/admin",
      },
      {
        path: "/register-group",
        name: "Registrar Grupo",
        rtlName: "تسجيل المجموعة",
        icon: <PersonIcon color='inherit' />,
        component: RegisterGroup,
        layout: "/admin",
      },
      {
        path: "/list-groups",
        name: "Listar Grupos",
        rtlName: "قائمة المجموعات",
        icon: <PersonIcon color='inherit' />,
        component: ListGroups,
        layout: "/admin",
      },
    ],
  },
  {
    name: "Productos e Inventario",
    category: "products",
    rtlName: "المنتجات والمخزون",
    state: "productsCollapse",
    icon: <RocketIcon color='inherit' />,
    views: [
      {
        path: "/register-product",
        name: "Registrar Producto",
        rtlName: "تسجيل المنتج",
        icon: <RocketIcon color='inherit' />,
        component: RegisterProduct,
        layout: "/admin",
      },
      {
        path: "/list-products",
        name: "Listar Productos",
        rtlName: "قائمة المنتجات",
        icon: <StatsIcon color='inherit' />,
        component: ListProducts,
        layout: "/admin",
      },
      {
        path: "/supply-entry",
        name: "Entradas de Insumos",
        rtlName: "إدخالات الإمدادات",
        icon: <DocumentIcon color='inherit' />,
        component: SupplyEntry,
        layout: "/admin",
      },
      {
        path: "/stock-control",
        name: "Controlar Stock",
        rtlName: "مراقبة المخزون",
        icon: <CreditIcon color='inherit' />,
        component: StockControl,
        layout: "/admin",
      },
    ],
  },
  {
    name: "Promociones",
    category: "promotions",
    rtlName: "العروض الترويجية",
    state: "promotionsCollapse",
    icon: <CreditIcon color='inherit' />,
    views: [
      {
        path: "/register-promotion",
        name: "Registrar Promoción",
        rtlName: "تسجيل العرض",
        icon: <CreditIcon color='inherit' />,
        component: RegisterPromotion,
        layout: "/admin",
      },
      {
        path: "/list-promotions",
        name: "Listar Promociones",
        rtlName: "قائمة العروض",
        icon: <StatsIcon color='inherit' />,
        component: ListPromotions,
        layout: "/admin",
      },
    ],
  },
  {
    name: "Proveedores",
    category: "suppliers",
    rtlName: "الموردون",
    state: "suppliersCollapse",
    icon: <StatsIcon color='inherit' />,
    views: [
      {
        path: "/register-supplier",
        name: "Registrar Proveedor",
        rtlName: "تسجيل المورد",
        icon: <PersonIcon color='inherit' />,
        component: RegisterSupplier,
        layout: "/admin",
      },
      {
        path: "/list-suppliers",
        name: "Listar Proveedores",
        rtlName: "قائمة الموردين",
        icon: <StatsIcon color='inherit' />,
        component: ListSuppliers,
        layout: "/admin",
      },
    ],
  },
  {
    name: "Pagos",
    category: "payments",
    rtlName: "المدفوعات",
    state: "paymentsCollapse",
    icon: <CreditIcon color='inherit' />,
    views: [
      {
        path: "/register-payment",
        name: "Registrar Pago",
        rtlName: "تسجيل الدفع",
        icon: <CreditIcon color='inherit' />,
        component: RegisterPayment,
        layout: "/admin",
      },
      {
        path: "/payment-methods",
        name: "Métodos de Pago",
        rtlName: "طرق الدفع",
        icon: <CreditIcon color='inherit' />,
        component: PaymentMethods,
        layout: "/admin",
      },
    ],
  },
  {
    name: "Configuración",
    category: "settings",
    rtlName: "الإعدادات",
    state: "settingsCollapse",
    icon: <SupportIcon color='inherit' />,
    views: [
      {
        path: "/activity-log",
        name: "Bitácora",
        rtlName: "سجل النشاط",
        icon: <DocumentIcon color='inherit' />,
        component: ActivityLog,
        layout: "/admin",
      },
      {
        path: "/logout",
        name: "Cerrar Sesión",
        rtlName: "تسجيل الخروج",
        icon: <SupportIcon color='inherit' />,
        component: Logout,
        layout: "/admin",
      },
    ],
  },
  {
    name: "ACCOUNT PAGES",
    category: "account",
    rtlName: "صفحات",
    state: "pageCollapse",
    views: [
      {
        path: "/profile",
        name: "Profile",
        rtlName: "لوحة القيادة",
        icon: <PersonIcon color='inherit' />,
        secondaryNavbar: true,
        component: Profile,
        layout: "/admin",
      },
      {
        path: "/signin",
        name: "Sign In",
        rtlName: "لوحة القيادة",
        icon: <DocumentIcon color='inherit' />,
        component: SignIn,
        layout: "/auth",
      },
      {
        path: "/signup",
        name: "Sign Up",
        rtlName: "لوحة القيادة",
        icon: <RocketIcon color='inherit' />,
        component: SignUp,
        layout: "/auth",
      },
      {
        path: "/reset-password",
        name: "Reset Password",
        rtlName: "إعادة تعيين كلمة المرور",
        icon: <DocumentIcon color='inherit' />,
        component: ResetPassword,
        layout: "/auth",
      },
    ],
  },
];
export default dashRoutes;
