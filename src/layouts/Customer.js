// chakra imports
import { Box, ChakraProvider } from "@chakra-ui/react";
import Footer from "components/Footer/Footer.js";
// core components
import CustomerNavbar from "components/Navbars/CustomerNavbar.js";
import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import routes from "routes.js";
// Assets - Imagen de fondo
import shopBackgroundImage from "assets/img/signInImage.png";

export default function CustomerLayout(props) {
  const { ...rest } = props;
  const wrapper = React.createRef();

  React.useEffect(() => {
    document.body.style.overflow = "unset";
    return function cleanup() {};
  });

  const getActiveRoute = (routes) => {
    let activeRoute = "E-Commerce";
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse) {
        let collapseActiveRoute = getActiveRoute(routes[i].views);
        if (collapseActiveRoute !== activeRoute) {
          return collapseActiveRoute;
        }
      } else if (routes[i].category) {
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

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.collapse) {
        return getRoutes(prop.views);
      }
      if (prop.category && prop.views) {
        return getRoutes(prop.views);
      }
      if (prop.layout === "/customer") {
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

  const navRef = React.useRef();

  return (
    <Box ref={navRef} w="100%">
      <CustomerNavbar logoText="TIENDA ONLINE" />
      <Box
        w="100%"
        minH="100vh"
        ref={wrapper}
        position="relative"
      >
        <Box position="relative" zIndex={1}>
          <Switch>
            {getRoutes(routes)}
            <Redirect from="/customer" to="/customer/shop" />
          </Switch>
        </Box>
        <Box
          overflowX="hidden"
          h="100%"
          w="100%"
          left="0px"
          position="absolute"
          top="0"
          bgImage={shopBackgroundImage}
          bgSize="cover"
          bgPosition="center"
          zIndex="0"
        >
          <Box w="100%" h="100%" bgSize="cover" bg="blue.500" opacity="0.8"></Box>
        </Box>
      </Box>
      <Box px="24px" mx="auto" width="1044px" maxW="100%">
        <Footer />
      </Box>
    </Box>
  );
}
