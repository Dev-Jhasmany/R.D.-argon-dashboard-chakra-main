// Chakra Icons
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
// Chakra Imports
import {
  Box, Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MenuDivider,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
  useToast,
  Icon,
} from "@chakra-ui/react";
// Assets
import avatar1 from "assets/img/avatars/avatar1.png";
import avatar2 from "assets/img/avatars/avatar2.png";
import avatar3 from "assets/img/avatars/avatar3.png";
// Custom Icons
import { ArgonLogoDark, ArgonLogoLight, ChakraLogoDark, ChakraLogoLight, ProfileIcon, SettingsIcon } from "components/Icons/Icons";
// Custom Components
import { ItemContent } from "components/Menu/ItemContent";
import { SidebarResponsive } from "components/Sidebar/Sidebar";
import React, { useState, useEffect } from "react";
import { NavLink, useHistory } from "react-router-dom";
import routes from "routes.js";
import { FiUser, FiLogOut } from "react-icons/fi";

export default function HeaderLinks(props) {
  const {
    variant,
    children,
    fixed,
    scrolled,
    secondary,
    onOpen,
    ...rest
  } = props;

  const { colorMode } = useColorMode();
  const [currentUser, setCurrentUser] = useState(null);
  const history = useHistory();
  const toast = useToast();

  useEffect(() => {
    // Función para cargar el usuario
    const loadUser = () => {
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
        }
      }
    };

    // Cargar usuario inicialmente
    loadUser();

    // Escuchar cambios en el storage (cuando se hace login en otra pestaña o después del login)
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        loadUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Intervalo para verificar cambios (fallback para cuando storage event no se dispara)
    const interval = setInterval(loadUser, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    // Limpiar datos del usuario
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');

    // Mostrar mensaje de éxito
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente",
      status: "success",
      duration: 2000,
      isClosable: true,
    });

    // Redirigir al login
    setTimeout(() => {
      history.push('/auth/signin');
    }, 500);
  };

  // Chakra Color Mode
  let navbarIcon =
    fixed && scrolled
      ? useColorModeValue("gray.700", "gray.200")
      : useColorModeValue("white", "gray.200");
  let menuBg = useColorModeValue("white", "navy.800");
  if (secondary) {
    navbarIcon = "white";
  }
  return (
    <Flex
      pe={{ sm: "0px", md: "16px" }}
      w={{ sm: "100%", md: "auto" }}
      alignItems='center'
      flexDirection='row'>
      <Menu>
        <MenuButton
          as={Button}
          ms='0px'
          px='0px'
          me={{ sm: "2px", md: "16px" }}
          color={navbarIcon}
          variant='no-effects'
          rightIcon={<ChevronDownIcon />}
          leftIcon={
            document.documentElement.dir ? (
              ""
            ) : (
              <ProfileIcon color={navbarIcon} w='22px' h='22px' me='0px' />
            )
          }>
          <Text display={{ sm: "none", md: "flex" }}>
            {currentUser ? `${currentUser.full_name || ''} ${currentUser.full_last_name || ''}`.trim() || currentUser.username : 'Sign In'}
          </Text>
        </MenuButton>
        <MenuList bg={menuBg} p='8px'>
          <MenuItem
            borderRadius='8px'
            _hover={{ bg: useColorModeValue("gray.100", "navy.700") }}
            onClick={() => history.push('/admin/users/user-info')}
          >
            <Flex align='center'>
              <Icon as={FiUser} w='16px' h='16px' me='8px' />
              <Text fontSize='sm'>Mi Perfil</Text>
            </Flex>
          </MenuItem>
          <MenuDivider />
          <MenuItem
            borderRadius='8px'
            _hover={{ bg: useColorModeValue("red.50", "red.900") }}
            color='red.500'
            onClick={handleLogout}
          >
            <Flex align='center'>
              <Icon as={FiLogOut} w='16px' h='16px' me='8px' />
              <Text fontSize='sm' fontWeight='bold'>Cerrar Sesión</Text>
            </Flex>
          </MenuItem>
        </MenuList>
      </Menu>
      <SidebarResponsive
        hamburgerColor={"white"}
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
        colorMode={colorMode}
        secondary={props.secondary}
        routes={routes}
        {...rest}
      />
      <SettingsIcon
        cursor='pointer'
        ms={{ base: "16px", xl: "0px" }}
        me='16px'
        onClick={props.onOpen}
        color={navbarIcon}
        w='18px'
        h='18px'
      />
      <Menu>
        <MenuButton>
          <BellIcon color={navbarIcon} w='18px' h='18px' />
        </MenuButton>
        <MenuList p='16px 8px' bg={menuBg}>
          <Flex flexDirection='column'>
            <MenuItem borderRadius='8px' mb='10px'>
              <ItemContent
                time='13 minutes ago'
                info='from Alicia'
                boldInfo='New Message'
                aName='Alicia'
                aSrc={avatar1}
              />
            </MenuItem>
            <MenuItem borderRadius='8px' mb='10px'>
              <ItemContent
                time='2 days ago'
                info='by Josh Henry'
                boldInfo='New Album'
                aName='Josh Henry'
                aSrc={avatar2}
              />
            </MenuItem>
            <MenuItem borderRadius='8px'>
              <ItemContent
                time='3 days ago'
                info='Payment succesfully completed!'
                boldInfo=''
                aName='Kara'
                aSrc={avatar3}
              />
            </MenuItem>
          </Flex>
        </MenuList>
      </Menu>
    </Flex>
  );
}