import React, { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Grid,
  Text,
  useColorModeValue,
  useToast,
  Spinner,
  Center,
  Badge,
} from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import authService from "services/authService";

function UserInfo() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();
  const history = useHistory();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      toast({
        title: "Error",
        description: "No se pudo obtener la información del usuario",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
        <Center h="400px">
          <Spinner size="xl" color="teal.300" />
        </Center>
      </Flex>
    );
  }

  if (!user) {
    return (
      <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
        <Center h="400px">
          <Text fontSize="lg" color="gray.500">
            No hay información del usuario disponible
          </Text>
        </Center>
      </Flex>
    );
  }

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
                  name={`${user.full_name} ${user.full_last_name}`}
                  me='18px'
                />
                <Flex direction='column'>
                  <Text fontSize='md' color={textColor} fontWeight='bold'>
                    {user.full_name} {user.full_last_name}
                  </Text>
                  <Text fontSize='sm' color='gray.400'>
                    @{user.username}
                  </Text>
                </Flex>
              </Flex>
              <Box>
                <Flex mb='12px'>
                  <Text fontSize='sm' color='gray.400' me='6px' fontWeight='bold'>
                    Email:
                  </Text>
                  <Text fontSize='sm' color={textColor}>
                    {user.email}
                  </Text>
                </Flex>
                <Flex mb='12px'>
                  <Text fontSize='sm' color='gray.400' me='6px' fontWeight='bold'>
                    CI:
                  </Text>
                  <Text fontSize='sm' color={textColor}>
                    {user.ci || "N/A"}
                  </Text>
                </Flex>
                <Flex mb='12px'>
                  <Text fontSize='sm' color='gray.400' me='6px' fontWeight='bold'>
                    Teléfono:
                  </Text>
                  <Text fontSize='sm' color={textColor}>
                    {user.phone_number || "N/A"}
                  </Text>
                </Flex>
                <Flex mb='12px'>
                  <Text fontSize='sm' color='gray.400' me='6px' fontWeight='bold'>
                    Dirección:
                  </Text>
                  <Text fontSize='sm' color={textColor}>
                    {user.address || "N/A"}
                  </Text>
                </Flex>
                <Flex mb='12px'>
                  <Text fontSize='sm' color='gray.400' me='6px' fontWeight='bold'>
                    Género:
                  </Text>
                  <Text fontSize='sm' color={textColor}>
                    {user.gender === 'male' ? 'Masculino' : user.gender === 'female' ? 'Femenino' : 'Otro'}
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
                    Fecha de Nacimiento:
                  </Text>
                  <Text fontSize='sm' color={textColor}>
                    {formatDate(user.date_of_birth)}
                  </Text>
                </Flex>
                <Flex mb='12px'>
                  <Text fontSize='sm' color='gray.400' me='6px' fontWeight='bold'>
                    Fecha de Registro:
                  </Text>
                  <Text fontSize='sm' color={textColor}>
                    {formatDate(user.created_at)}
                  </Text>
                </Flex>
              </Box>
              <Flex gap='10px' mt='24px'>
                <Button
                  onClick={() => history.push('/admin/users/change-password')}
                  variant='dark'
                  fontSize='sm'
                  fontWeight='bold'
                  flex='1'>
                  CAMBIAR CONTRASEÑA
                </Button>
              </Flex>
            </Flex>
          </CardBody>
        </Card>

        <Card p='16px'>
          <CardHeader p='12px 5px' mb='12px'>
            <Text fontSize='lg' color={textColor} fontWeight='bold'>
              Información Adicional
            </Text>
          </CardHeader>
          <CardBody px='5px'>
            <Flex direction='column'>
              <Box mb='18px'>
                <Text fontSize='sm' color='gray.400' fontWeight='bold' mb='8px'>
                  Última Actualización:
                </Text>
                <Text fontSize='sm' color={textColor}>
                  {formatDate(user.updated_at)}
                </Text>
              </Box>
              <Box mb='18px'>
                <Text fontSize='sm' color='gray.400' fontWeight='bold' mb='8px'>
                  ID de Usuario:
                </Text>
                <Text fontSize='xs' color={textColor} fontFamily='monospace'>
                  {user.id}
                </Text>
              </Box>
              <Box>
                <Badge colorScheme='green' p='6px 12px' borderRadius='8px'>
                  Cuenta Verificada
                </Badge>
              </Box>
            </Flex>
          </CardBody>
        </Card>
      </Grid>
    </Flex>
  );
}

export default UserInfo;
