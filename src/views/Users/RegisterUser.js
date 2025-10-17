import React, { useState, useEffect } from "react";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Text,
  useColorModeValue,
  useToast,
  Select,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import userService from "services/userService";
import roleService from "services/roleService";

function RegisterUser() {
  const textColor = useColorModeValue("gray.700", "white");
  const toast = useToast();
  const history = useHistory();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    ci: "",
    full_name: "",
    full_last_name: "",
    date_of_birth: "",
    address: "",
    phone_number: "",
    gender: "other",
    roleId: "",
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoadingRoles(true);
    const result = await roleService.getAllRoles();
    if (result.success) {
      setRoles(result.data);
      if (result.data.length === 0) {
        toast({
          title: "Sin roles disponibles",
          description: "Debe registrar al menos un rol antes de crear usuarios",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setLoadingRoles(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    // Validar que haya roles disponibles
    if (roles.length === 0) {
      toast({
        title: "Error",
        description: "No hay roles disponibles. Debe registrar al menos un rol primero.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }

    // Validar campos obligatorios
    if (!formData.username || !formData.email || !formData.password ||
        !formData.ci || !formData.full_name || !formData.full_last_name || !formData.gender || !formData.roleId) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos obligatorios",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const userData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      ci: formData.ci,
      full_name: formData.full_name,
      full_last_name: formData.full_last_name,
      gender: formData.gender,
      roleId: formData.roleId,  // ← Agregar roleId
      // Campos opcionales (solo enviar si tienen valor)
      ...(formData.date_of_birth && { date_of_birth: formData.date_of_birth }),
      ...(formData.address && { address: formData.address }),
      ...(formData.phone_number && { phone_number: formData.phone_number }),
    };

    const result = await userService.createUser(userData);
    setLoading(false);

    if (result.success) {
      toast({
        title: "Usuario registrado",
        description: "El usuario ha sido registrado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Resetear formulario
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        ci: "",
        full_name: "",
        full_last_name: "",
        date_of_birth: "",
        address: "",
        phone_number: "",
        gender: "other",
        roleId: "",
      });
      // Opcional: redirigir a lista de usuarios
      // history.push("/admin/users/list");
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loadingRoles) {
    return (
      <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
        <Center h="400px">
          <Spinner size="xl" color="teal.300" />
          <Text ml={4}>Cargando roles...</Text>
        </Center>
      </Flex>
    );
  }

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Registrar Usuario
          </Text>
        </CardHeader>
        <CardBody>
          <Flex direction='column' w='100%'>
            {roles.length === 0 && (
              <Alert status="warning" mb="24px" borderRadius="8px">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  No hay roles disponibles. Por favor, registre al menos un rol antes de crear usuarios.
                </AlertDescription>
              </Alert>
            )}
            {/* Fila 1: Username y Email */}
            <Grid templateColumns='repeat(2, 1fr)' gap={6} mb='24px'>
              <FormControl isRequired>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Nombre de Usuario
                </FormLabel>
                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  borderRadius='15px'
                  fontSize='sm'
                  type='text'
                  placeholder='Ej: jdoe'
                  size='lg'
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Email
                </FormLabel>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  borderRadius='15px'
                  fontSize='sm'
                  type='email'
                  placeholder='usuario@email.com'
                  size='lg'
                />
              </FormControl>
            </Grid>

            {/* Fila 2: CI y Género */}
            <Grid templateColumns='repeat(2, 1fr)' gap={6} mb='24px'>
              <FormControl isRequired>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Cédula de Identidad (CI)
                </FormLabel>
                <Input
                  name="ci"
                  value={formData.ci}
                  onChange={handleChange}
                  borderRadius='15px'
                  fontSize='sm'
                  type='text'
                  placeholder='Ej: 7896541'
                  size='lg'
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Género
                </FormLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  borderRadius='15px'
                  fontSize='sm'
                  size='lg'
                >
                  <option value='male'>Masculino</option>
                  <option value='female'>Femenino</option>
                  <option value='other'>Otro</option>
                </Select>
              </FormControl>
            </Grid>

            {/* Fila 2.5: Rol */}
            <Grid templateColumns='repeat(1, 1fr)' gap={6} mb='24px'>
              <FormControl isRequired>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Rol del Usuario
                </FormLabel>
                <Select
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleChange}
                  borderRadius='15px'
                  fontSize='sm'
                  size='lg'
                  placeholder='Seleccione un rol'
                  isDisabled={roles.length === 0}
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} - Nivel {role.hierarchyLevel}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Fila 3: Nombres y Apellidos */}
            <Grid templateColumns='repeat(2, 1fr)' gap={6} mb='24px'>
              <FormControl isRequired>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Nombres
                </FormLabel>
                <Input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  borderRadius='15px'
                  fontSize='sm'
                  type='text'
                  placeholder='Ej: Juan Carlos'
                  size='lg'
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Apellidos
                </FormLabel>
                <Input
                  name="full_last_name"
                  value={formData.full_last_name}
                  onChange={handleChange}
                  borderRadius='15px'
                  fontSize='sm'
                  type='text'
                  placeholder='Ej: Pérez García'
                  size='lg'
                />
              </FormControl>
            </Grid>

            {/* Fila 4: Contraseña y Confirmar */}
            <Grid templateColumns='repeat(2, 1fr)' gap={6} mb='24px'>
              <FormControl isRequired>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Contraseña
                </FormLabel>
                <Input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  borderRadius='15px'
                  fontSize='sm'
                  type='password'
                  placeholder='Mínimo 6 caracteres'
                  size='lg'
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Confirmar Contraseña
                </FormLabel>
                <Input
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  borderRadius='15px'
                  fontSize='sm'
                  type='password'
                  placeholder='Confirme contraseña'
                  size='lg'
                />
              </FormControl>
            </Grid>

            {/* Fila 5: Fecha de Nacimiento y Teléfono (Opcionales) */}
            <Grid templateColumns='repeat(2, 1fr)' gap={6} mb='24px'>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Fecha de Nacimiento (Opcional)
                </FormLabel>
                <Input
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  borderRadius='15px'
                  fontSize='sm'
                  type='date'
                  size='lg'
                />
              </FormControl>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Teléfono (Opcional)
                </FormLabel>
                <Input
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  borderRadius='15px'
                  fontSize='sm'
                  type='tel'
                  placeholder='Ej: +591 77777777'
                  size='lg'
                />
              </FormControl>
            </Grid>

            {/* Fila 6: Dirección (Opcional) */}
            <Grid templateColumns='repeat(1, 1fr)' gap={6} mb='24px'>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Dirección (Opcional)
                </FormLabel>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  borderRadius='15px'
                  fontSize='sm'
                  type='text'
                  placeholder='Ej: Av. Central #123'
                  size='lg'
                />
              </FormControl>
            </Grid>
            <Button
              onClick={handleSubmit}
              isLoading={loading}
              variant='dark'
              fontSize='sm'
              fontWeight='bold'
              w='200px'
              h='45px'
              mb='24px'>
              REGISTRAR USUARIO
            </Button>
          </Flex>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default RegisterUser;
