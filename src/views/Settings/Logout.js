import React from "react";
import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import { FaSignOutAlt } from "react-icons/fa";

function Logout() {
  const textColor = useColorModeValue("gray.700", "white");
  const iconColor = useColorModeValue("blue.500", "blue.500");

  const handleLogout = () => {
    // Aquí iría la lógica de cierre de sesión
    console.log("Cerrando sesión...");
    // Ejemplo: limpiar tokens, redirigir a login, etc.
  };

  return (
    <Flex
      direction='column'
      pt={{ base: "120px", md: "75px" }}
      align='center'
      justify='center'
      minH='calc(100vh - 200px)'>
      <Card maxW='500px' p='40px'>
        <CardBody>
          <Flex direction='column' align='center' textAlign='center'>
            <Flex
              align='center'
              justify='center'
              w='100px'
              h='100px'
              borderRadius='50%'
              bg='blue.50'
              mb='24px'>
              <Icon as={FaSignOutAlt} w='50px' h='50px' color={iconColor} />
            </Flex>
            <Text fontSize='2xl' color={textColor} fontWeight='bold' mb='16px'>
              Cerrar Sesión
            </Text>
            <Text fontSize='md' color='gray.400' mb='32px'>
              ¿Estás seguro que deseas cerrar tu sesión? Tendrás que volver a iniciar sesión
              para acceder al sistema.
            </Text>
            <Flex gap='12px' w='100%'>
              <Button
                variant='outline'
                colorScheme='gray'
                fontSize='sm'
                fontWeight='bold'
                w='50%'
                h='45px'
                onClick={() => window.history.back()}>
                CANCELAR
              </Button>
              <Button
                variant='solid'
                colorScheme='red'
                fontSize='sm'
                fontWeight='bold'
                w='50%'
                h='45px'
                onClick={handleLogout}>
                CERRAR SESIÓN
              </Button>
            </Flex>
          </Flex>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default Logout;
