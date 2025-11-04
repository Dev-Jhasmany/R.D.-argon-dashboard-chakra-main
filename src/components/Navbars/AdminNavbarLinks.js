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
  Badge,
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
import React, { useState, useEffect, useRef } from "react";
import { NavLink, useHistory } from "react-router-dom";
import routes from "routes.js";
import { FiUser, FiLogOut } from "react-icons/fi";
import orderService from "services/orderService";
import salesService from "services/salesService";

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

  // Estados para notificaciones de pedidos (solo para cocineros)
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [previousOrdersCount, setPreviousOrdersCount] = useState(0);
  const audioRef = useRef(null);

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

  // Monitorear pedidos para cocineros (Nivel 3) y cajeros (Nivel 2)
  useEffect(() => {
    // Debug: Mostrar información del usuario actual
    console.log('🔍 Usuario actual:', currentUser);
    console.log('🔍 Rol:', currentUser?.role);
    console.log('🔍 Role name:', currentUser?.role?.name);
    console.log('🔍 Role hierarchyLevel:', currentUser?.role?.hierarchyLevel, 'type:', typeof currentUser?.role?.hierarchyLevel);

    // Verificar si el usuario es cocinero (nivel 3)
    const isCocinero = currentUser?.role?.name === 'Cocinero' && (currentUser?.role?.hierarchyLevel === 3 || currentUser?.role?.hierarchyLevel === '3');

    // Verificar si el usuario es cajero (nivel 2)
    const isCajero = (currentUser?.role?.name === 'Cajero' || currentUser?.role?.name === 'CAJERO') && (currentUser?.role?.hierarchyLevel === 2 || currentUser?.role?.hierarchyLevel === '2');

    console.log('🔍 ¿Es cocinero?:', isCocinero);
    console.log('🔍 ¿Es cajero?:', isCajero);

    // Si no es ni cocinero ni cajero, no monitorear pedidos
    if (!isCocinero && !isCajero) {
      console.log('⚠️ No es cocinero ni cajero, no se monitorearán pedidos');
      return;
    }

    console.log('✅ Es cocinero o cajero, iniciando monitoreo...');

    // Función para cargar pedidos según el rol
    const checkOrders = async () => {
      try {
        if (isCocinero) {
          // Para cocineros: monitorear pedidos activos
          console.log('📞 Consultando pedidos activos (Cocinero)...');
          const result = await orderService.getActiveOrders();
          console.log('📦 Resultado de pedidos activos:', result);

          if (result.success && result.data) {
            const activeOrdersCount = result.data.length;
            console.log(`📊 Total de pedidos activos: ${activeOrdersCount} (anterior: ${previousOrdersCount})`);

            // Si hay más pedidos que antes, reproducir sonido y mostrar notificación
            if (activeOrdersCount > previousOrdersCount && previousOrdersCount > 0) {
              console.log('🔔 ¡Nuevo pedido detectado! Mostrando notificación...');
              // Reproducir sonido de alerta
              if (audioRef.current) {
                audioRef.current.play().catch(e => console.log('Error playing sound:', e));
              }

              // Mostrar toast de notificación
              toast({
                title: "🔔 Nuevo Pedido Activo",
                description: `Tienes ${activeOrdersCount} pedido${activeOrdersCount > 1 ? 's' : ''} activo${activeOrdersCount > 1 ? 's' : ''}`,
                status: "info",
                duration: 5000,
                isClosable: true,
                position: "top-right",
              });
            }

            setNewOrdersCount(activeOrdersCount);
            setPreviousOrdersCount(activeOrdersCount);
          }
        } else if (isCajero) {
          // Para cajeros: monitorear pedidos pendientes de pago
          console.log('💳 Consultando pedidos pendientes de pago (Cajero)...');
          const result = await salesService.getPendingPaymentOrders();
          console.log('💰 Resultado de pedidos pendientes:', result);

          if (result.success && result.data) {
            const pendingPaymentsCount = result.data.length;
            console.log(`💵 Total de pedidos pendientes de pago: ${pendingPaymentsCount} (anterior: ${previousOrdersCount})`);

            // Si hay más pedidos pendientes que antes, reproducir sonido y mostrar notificación
            if (pendingPaymentsCount > previousOrdersCount && previousOrdersCount > 0) {
              console.log('🔔 ¡Nuevo pedido pendiente de pago! Mostrando notificación...');
              // Reproducir sonido de alerta
              if (audioRef.current) {
                audioRef.current.play().catch(e => console.log('Error playing sound:', e));
              }

              // Mostrar toast de notificación
              toast({
                title: "💳 Nuevo Pedido Online Pendiente",
                description: `Tienes ${pendingPaymentsCount} pedido${pendingPaymentsCount > 1 ? 's' : ''} pendiente${pendingPaymentsCount > 1 ? 's' : ''} de confirmar pago`,
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top-right",
              });
            }

            setNewOrdersCount(pendingPaymentsCount);
            setPreviousOrdersCount(pendingPaymentsCount);
          }
        }
      } catch (error) {
        console.error('Error checking orders:', error);
      }
    };

    // Cargar pedidos inmediatamente
    checkOrders();

    // Monitorear cada 15 segundos
    const interval = setInterval(checkOrders, 15000);

    return () => clearInterval(interval);
  }, [currentUser, previousOrdersCount, toast]);

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
        position: "top-right",
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
        <MenuButton position="relative">
          <BellIcon color={navbarIcon} w='18px' h='18px' />
          {/* Badge de notificación para cocineros (nivel 3) y cajeros (nivel 2) */}
          {(
            (currentUser?.role?.name === 'Cocinero' && (currentUser?.role?.hierarchyLevel === 3 || currentUser?.role?.hierarchyLevel === '3')) ||
            ((currentUser?.role?.name === 'Cajero' || currentUser?.role?.name === 'CAJERO') && (currentUser?.role?.hierarchyLevel === 2 || currentUser?.role?.hierarchyLevel === '2'))
          ) && newOrdersCount > 0 && (
            <Badge
              position="absolute"
              top="-6px"
              right="-6px"
              borderRadius="full"
              bg="red.500"
              color="white"
              fontSize="10px"
              minW="18px"
              h="18px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontWeight="bold"
              animation="pulse 2s infinite"
            >
              {newOrdersCount}
            </Badge>
          )}
        </MenuButton>
        <MenuList p='16px 8px' bg={menuBg}>
          <Flex flexDirection='column'>
            {/* Notificaciones para cocineros (nivel 3) */}
            {currentUser?.role?.name === 'Cocinero' && (currentUser?.role?.hierarchyLevel === 3 || currentUser?.role?.hierarchyLevel === '3') && newOrdersCount > 0 ? (
              <MenuItem
                borderRadius='8px'
                mb='10px'
                bg={useColorModeValue("orange.50", "orange.900")}
                onClick={() => {
                  history.push('/admin/orders-list');
                  setTimeout(() => window.location.reload(), 100);
                }}
                cursor="pointer"
                _hover={{ bg: useColorModeValue("orange.100", "orange.800") }}
              >
                <Flex align="center" w="100%">
                  <Box
                    bg="orange.500"
                    borderRadius="50%"
                    w="40px"
                    h="40px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    me="12px"
                  >
                    <Text fontSize="lg" fontWeight="bold" color="white">
                      {newOrdersCount}
                    </Text>
                  </Box>
                  <Flex direction="column">
                    <Text fontSize="sm" fontWeight="bold" color="orange.700">
                      Pedidos Activos
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {newOrdersCount} pedido{newOrdersCount > 1 ? 's' : ''} en espera
                    </Text>
                  </Flex>
                </Flex>
              </MenuItem>
            ) : /* Notificaciones para cajeros (nivel 2) */
            (currentUser?.role?.name === 'Cajero' || currentUser?.role?.name === 'CAJERO') && (currentUser?.role?.hierarchyLevel === 2 || currentUser?.role?.hierarchyLevel === '2') && newOrdersCount > 0 ? (
              <MenuItem
                borderRadius='8px'
                mb='10px'
                bg={useColorModeValue("yellow.50", "yellow.900")}
                onClick={() => {
                  history.push('/admin/confirm-payment');
                  setTimeout(() => window.location.reload(), 100);
                }}
                cursor="pointer"
                _hover={{ bg: useColorModeValue("yellow.100", "yellow.800") }}
              >
                <Flex align="center" w="100%">
                  <Box
                    bg="yellow.500"
                    borderRadius="50%"
                    w="40px"
                    h="40px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    me="12px"
                  >
                    <Text fontSize="lg" fontWeight="bold" color="white">
                      {newOrdersCount}
                    </Text>
                  </Box>
                  <Flex direction="column">
                    <Text fontSize="sm" fontWeight="bold" color="yellow.700">
                      Pagos Pendientes
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {newOrdersCount} pedido{newOrdersCount > 1 ? 's' : ''} online pendiente{newOrdersCount > 1 ? 's' : ''}
                    </Text>
                  </Flex>
                </Flex>
              </MenuItem>
            ) : (
              <>
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
              </>
            )}
          </Flex>
        </MenuList>
      </Menu>

      {/* Audio element para sonido de notificación */}
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ0PVqzn77BdGAg+ltryxnMlBSuAzvLZizkHGGS67OmfUhELTqXh8bllHAY2jtLtynYuBSN1xu/glUcOE120696qWhYKQ5vd8sFuJAUte9Hx1YU2Bhpp0O7mnFUODVGq5O+yYRoJPZPY88h0KAUnfs/w25E8CBhkuu3pn1IRDVW05/C1ZyEHNovU8s18MAYhb8Tv5ZtWEQxQq+Pxt2UdBzaM1O7Kdi8FJHXF7uGYUxAOT6jj8LZkHQc2jdTuymcvBSJzxe3fl1EOEVSx6O+zZB4IMJTa9MZ0LQUjdMXv45tWEQxPq+TwtmUdBzaL1vDMeS8FI3HE7eCXUhEOVLDo77JjHgcxldjzxnQrBSJ0xe7hmFQQDU6r5O+2ZR0HNozU7st2LwUjdMXw4ZhUEA1Qq+TwtmQeBzGL1fHNei8FI3HE7uCXURANUazj8LZkHgcxit/1xnQtBSJzxe7gl1MPDVCr5O+2ZR0HNozT7sp3LwUjdMXv4JdTEA1QrOPwtmQeBzGK1fHNei8GInHE7eCWUhANUKzk8LZkHgcxit7yx3QtBSN0xO7glVMPDlCq5O+2Zh0IMo3T7st3LwUjdMTv4JdTDw5Qq+TwtmQdBzGK1fHOei8GInHD7t+WUxAOUKzk8LZkHQcwi9Xxy3kvBSNwxO7gl1MQDlCr5O+2ZR0HM4zU7sx3LwUjdMTu4JZTEA1PrOTvtmUdCDGK1fHNei8GInDD7eCWUg8OUazk8LZkHQcxjNXxzXkvBiJxw+7glVMQDlCr5O+2ZB0HMYrU8c16LwYjcMPu4JZTEA1Qq+TwtmQeBzGK1PHPKB0AAAAAAAAAAAAA" />
    </Flex>
  );
}