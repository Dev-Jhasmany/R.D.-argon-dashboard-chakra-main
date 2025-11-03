import React from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  useColorModeValue,
  Icon,
  Badge,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { FiShoppingCart, FiUser, FiMenu } from "react-icons/fi";

export default function CustomerNavbar(props) {
  const { logoText, ...rest } = props;
  const history = useHistory();

  // Chakra color mode
  const navbarBg = useColorModeValue("white", "gray.800");
  const navbarShadow = useColorModeValue(
    "0px 7px 23px rgba(0, 0, 0, 0.05)",
    "none"
  );
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Obtener carrito del localStorage
  const [cartCount, setCartCount] = React.useState(0);

  React.useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("customerCart") || "[]");
      const count = cart.reduce((total, item) => total + item.quantity, 0);
      setCartCount(count);
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  const handleNavigate = (path) => {
    history.push(path);
  };

  return (
    <Flex
      position="sticky"
      top="0"
      zIndex="999"
      boxShadow={navbarShadow}
      bg={navbarBg}
      borderColor={borderColor}
      borderBottom="1px solid"
      alignItems="center"
      justifyContent="space-between"
      px={{ base: "15px", md: "30px" }}
      py="15px"
      {...rest}
    >
      {/* Logo */}
      <Flex alignItems="center">
        <Text
          fontSize={{ base: "lg", md: "xl" }}
          fontWeight="bold"
          color={textColor}
          cursor="pointer"
          onClick={() => handleNavigate("/customer/shop")}
        >
          {logoText || "TIENDA"}
        </Text>
      </Flex>

      {/* Navigation */}
      <HStack spacing={{ base: 2, md: 4 }}>
        <Button
          variant="ghost"
          size={{ base: "sm", md: "md" }}
          onClick={() => handleNavigate("/customer/shop")}
        >
          Productos
        </Button>

        {/* Cart Button */}
        <Button
          variant="ghost"
          size={{ base: "sm", md: "md" }}
          onClick={() => handleNavigate("/customer/cart")}
          position="relative"
        >
          <Icon as={FiShoppingCart} w={5} h={5} />
          {cartCount > 0 && (
            <Badge
              position="absolute"
              top="-5px"
              right="-5px"
              colorScheme="red"
              borderRadius="full"
              fontSize="xs"
              minW="20px"
              h="20px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {cartCount}
            </Badge>
          )}
        </Button>

        {/* User Menu */}
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<Icon as={FiUser} w={5} h={5} />}
            variant="ghost"
            size={{ base: "sm", md: "md" }}
          />
          <MenuList>
            <MenuItem onClick={() => handleNavigate("/customer/orders")}>
              Mis Pedidos
            </MenuItem>
            <MenuItem onClick={() => handleNavigate("/auth/signin")}>
              Iniciar Sesión (Admin)
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  );
}
