import React from "react";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Grid,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";

function UserInfo() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgProfile = useColorModeValue("white", "navy.800");

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Grid templateColumns={{ sm: "1fr", xl: "repeat(2, 1fr)" }} gap='22px'>
        <Card p='16px'>
          <CardHeader p='12px 5px' mb='12px'>
            <Text fontSize='lg' color={textColor} fontWeight='bold'>
              Información del Usuario
            </Text>
          </CardHeader>
          <CardBody px='5px'>
            <Flex direction='column'>
              <Flex align='center' mb='18px'>
                <Avatar
                  size='xl'
                  name='Usuario Ejemplo'
                  me='18px'
                />
                <Flex direction='column'>
                  <Text fontSize='md' color={textColor} fontWeight='bold'>
                    Usuario Ejemplo
                  </Text>
                  <Text fontSize='sm' color='gray.400'>
                    usuario@email.com
                  </Text>
                </Flex>
              </Flex>
              <Box>
                <Flex mb='12px'>
                  <Text fontSize='sm' color='gray.400' me='6px' fontWeight='bold'>
                    Nombre Completo:
                  </Text>
                  <Text fontSize='sm' color={textColor}>
                    Juan Pérez García
                  </Text>
                </Flex>
                <Flex mb='12px'>
                  <Text fontSize='sm' color='gray.400' me='6px' fontWeight='bold'>
                    Email:
                  </Text>
                  <Text fontSize='sm' color={textColor}>
                    usuario@email.com
                  </Text>
                </Flex>
                <Flex mb='12px'>
                  <Text fontSize='sm' color='gray.400' me='6px' fontWeight='bold'>
                    Teléfono:
                  </Text>
                  <Text fontSize='sm' color={textColor}>
                    +591 12345678
                  </Text>
                </Flex>
                <Flex mb='12px'>
                  <Text fontSize='sm' color='gray.400' me='6px' fontWeight='bold'>
                    Rol:
                  </Text>
                  <Text fontSize='sm' color={textColor}>
                    Administrador
                  </Text>
                </Flex>
                <Flex mb='12px'>
                  <Text fontSize='sm' color='gray.400' me='6px' fontWeight='bold'>
                    Estado:
                  </Text>
                  <Text fontSize='sm' color='green.400' fontWeight='bold'>
                    Activo
                  </Text>
                </Flex>
                <Flex mb='12px'>
                  <Text fontSize='sm' color='gray.400' me='6px' fontWeight='bold'>
                    Fecha de Registro:
                  </Text>
                  <Text fontSize='sm' color={textColor}>
                    15/10/2024
                  </Text>
                </Flex>
              </Box>
              <Button
                variant='dark'
                fontSize='sm'
                fontWeight='bold'
                w='200px'
                h='45px'
                mt='24px'>
                EDITAR INFORMACIÓN
              </Button>
            </Flex>
          </CardBody>
        </Card>

        <Card p='16px'>
          <CardHeader p='12px 5px' mb='12px'>
            <Text fontSize='lg' color={textColor} fontWeight='bold'>
              Actividad Reciente
            </Text>
          </CardHeader>
          <CardBody px='5px'>
            <Flex direction='column'>
              <Flex mb='18px'>
                <Box>
                  <Text fontSize='sm' color={textColor} fontWeight='bold'>
                    Último acceso
                  </Text>
                  <Text fontSize='xs' color='gray.400'>
                    15/10/2024 - 14:30
                  </Text>
                </Box>
              </Flex>
              <Flex mb='18px'>
                <Box>
                  <Text fontSize='sm' color={textColor} fontWeight='bold'>
                    Cambio de contraseña
                  </Text>
                  <Text fontSize='xs' color='gray.400'>
                    10/10/2024 - 10:15
                  </Text>
                </Box>
              </Flex>
              <Flex mb='18px'>
                <Box>
                  <Text fontSize='sm' color={textColor} fontWeight='bold'>
                    Actualización de perfil
                  </Text>
                  <Text fontSize='xs' color='gray.400'>
                    05/10/2024 - 16:45
                  </Text>
                </Box>
              </Flex>
            </Flex>
          </CardBody>
        </Card>
      </Grid>
    </Flex>
  );
}

export default UserInfo;
