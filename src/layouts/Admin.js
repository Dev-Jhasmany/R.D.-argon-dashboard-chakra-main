// Chakra imports
import {
  Portal,
  useDisclosure,
  Stack,
  Box,
  useColorMode,
} from "@chakra-ui/react";
import Configurator from "components/Configurator/Configurator";
import Footer from "components/Footer/Footer.js";
import {
  ArgonLogoDark,
  ArgonLogoLight,
  ChakraLogoDark,
  ChakraLogoLight,
} from "components/Icons/Icons";
// Layout components
import AdminNavbar from "components/Navbars/AdminNavbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import routes from "routes.js";
import { usePermissions } from "hooks/usePermissions";
// Custom Chakra theme
import FixedPlugin from "../components/FixedPlugin/FixedPlugin";
// Custom components
import MainPanel from "../components/Layout/MainPanel";
import PanelContainer from "../components/Layout/PanelContainer";
import PanelContent from "../components/Layout/PanelContent";
import bgAdmin from "assets/img/admin-background.png";

export default function Dashboard(props) {
  const { ...rest } = props;
  const { colorMode } = useColorMode();
  const { hasAccessToCategory, hasAccessToSubmenu, loading: permissionsLoading } = usePermissions();

  // functions for changing the states from components
  const getRoute = () => {
    return window.location.pathname !== "/admin/full-screen-maps";
  };
  const getActiveRoute = (routes) => {
    let activeRoute = "Default Brand Text";
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse) {
        let collapseActiveRoute = getActiveRoute(routes[i].views);
        if (collapseActiveRoute !== activeRoute) {
          return collapseActiveRoute;
        }
      } else if (routes[i].category && routes[i].views) {
        let categoryActiveRoute = getActiveRoute(routes[i].views);
        if (categoryActiveRoute !== activeRoute) {
          return categoryActiveRoute;
        }
      } else {
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        ) {
          return routes[i].name;
        }
      }
    }
    return activeRoute;
  };
  // This changes navbar state(fixed or not)
  const getActiveNavbar = (routes) => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].category && routes[i].views) {
        let categoryActiveNavbar = getActiveNavbar(routes[i].views);
        if (categoryActiveNavbar !== activeNavbar) {
          return categoryActiveNavbar;
        }
      } else {
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        ) {
          if (routes[i].secondaryNavbar) {
            return routes[i].secondaryNavbar;
          }
        }
      }
    }
    return activeNavbar;
  };
  // Obtener la primera ruta accesible para el usuario
  const getFirstAccessibleRoute = (routes) => {
    // Si aún está cargando permisos, esperar
    if (permissionsLoading) {
      return null; // No redirigir hasta que se carguen los permisos
    }

    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];

      // Si es una ruta simple (como Dashboard) - verificar primero
      if (route.category && !route.views && route.layout === "/admin") {
        if (hasAccessToCategory(route.name)) {
          return route.layout + route.path;
        }
      }
      // Si tiene vistas (es una categoría con submenús)
      else if (route.category && route.views) {
        // Verificar si tiene acceso a la categoría
        if (hasAccessToCategory(route.name)) {
          // Buscar el primer submenú accesible
          for (let view of route.views) {
            if (hasAccessToSubmenu(route.name, view.name) && view.layout === "/admin") {
              return view.layout + view.path;
            }
          }
        }
      }
    }
    // Si no tiene acceso a ninguna ruta, redirigir a logout
    return "/admin/logout";
  };

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.collapse) {
        return getRoutes(prop.views);
      }
      if (prop.category && prop.views) {
        return getRoutes(prop.views);
      }
      if (prop.layout === "/admin") {
        // Verificar permisos antes de renderizar la ruta
        // Si la ruta tiene un 'name' asociado a una categoría/submenú, verificar acceso
        if (prop.name) {
          // Buscar la categoría padre de esta vista
          const parentCategory = routes.find(r =>
            r.views && r.views.some(v => v.path === prop.path)
          );

          if (parentCategory && parentCategory.name) {
            // Verificar si tiene acceso al submenú
            if (!hasAccessToSubmenu(parentCategory.name, prop.name)) {
              return null; // No renderizar la ruta si no tiene acceso
            }
          }
        }

        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        );
      } else {
        return null;
      }
    });
  };
  const { isOpen, onOpen, onClose } = useDisclosure();
  document.documentElement.dir = "ltr";
  // Chakra Color Mode
  return (
    <Box>
      <Box
        minH='40vh'
        w='100%'
        position='absolute'
        bgImage={colorMode === "light" ? bgAdmin : "none"}
        bg={colorMode === "light" ? bgAdmin : "navy.900"}
        bgSize='cover'
        top='0'
      />
      <Sidebar
        routes={routes}
        logo={
          <Stack direction='row' spacing='12px' align='center' justify='center'>
            {colorMode === "dark" ? (
              <ArgonLogoLight w='74px' h='27px' />
            ) : (
              <ArgonLogoDark w='74px' h='27px' />
            )}
            <Box
              w='1px'
              h='20px'
              bg={colorMode === "dark" ? "white" : "gray.700"}
            />
            {colorMode === "dark" ? (
              <ChakraLogoLight w='82px' h='21px' />
            ) : (
              <ChakraLogoDark w='82px' h='21px' />
            )}
          </Stack>
        }
        display='none'
        {...rest}
      />
      <MainPanel
        w={{
          base: "100%",
          xl: "calc(100% - 275px)",
        }}>
        <Portal>
          <AdminNavbar
            onOpen={onOpen}
            brandText={getActiveRoute(routes)}
            secondary={getActiveNavbar(routes)}
            {...rest}
          />
        </Portal>
        {getRoute() ? (
          <PanelContent>
            <PanelContainer>
              <Switch>
                {getRoutes(routes)}
                {!permissionsLoading && (
                  <Redirect from='/admin' to={getFirstAccessibleRoute(routes)} />
                )}
              </Switch>
            </PanelContainer>
          </PanelContent>
        ) : null}
        <Footer />
        <Portal>
          <FixedPlugin
            secondary={getActiveNavbar(routes)}
            onOpen={onOpen}
          />
        </Portal>
        <Configurator
          isOpen={isOpen}
          onClose={onClose}
        />
      </MainPanel>
    </Box>
  );
}
