import React, { useState } from "react";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
  Select,
  FormHelperText,
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import roleService from "services/roleService";

function RegisterRole() {
  const textColor = useColorModeValue("gray.700", "white");
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    hierarchyLevel: 10,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'hierarchyLevel' ? parseInt(value, 10) : (type === 'number' ? parseInt(value, 10) : value),
    }));
  };

  const handleSubmit = async () => {
    // Validación
    if (!formData.name) {
      toast({
        title: "Error",
        description: "Por favor ingrese el nombre del rol",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    setLoading(true);
    const result = await roleService.createRole(formData);
    setLoading(false);

    if (result.success) {
      toast({
        title: "Rol registrado",
        description: "El rol ha sido registrado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      // Limpiar formulario
      setFormData({
        name: "",
        description: "",
        hierarchyLevel: 10,
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px' maxW='800px' mx='auto'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Registrar Rol
          </Text>
        </CardHeader>
        <CardBody>
          <Flex direction='column' w='100%'>
            <FormControl mb='24px' isRequired>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Nombre del Rol
              </FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                borderRadius='15px'
                fontSize='sm'
                type='text'
                placeholder='Ej: Administrador, Vendedor, Almacenero'
                size='lg'
              />
            </FormControl>
            <FormControl mb='24px'>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Descripción
              </FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                borderRadius='15px'
                fontSize='sm'
                placeholder='Descripción del rol y sus responsabilidades'
                rows={4}
              />
            </FormControl>
            <FormControl mb='24px'>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Nivel Jerárquico
              </FormLabel>
              <Select
                name="hierarchyLevel"
                value={formData.hierarchyLevel}
                onChange={handleChange}
                borderRadius='15px'
                fontSize='sm'
                size='lg'
              >
                <option value={1}>Nivel 1 (Más alto - Administrador)</option>
                <option value={2}>Nivel 2</option>
                <option value={3}>Nivel 3</option>
                <option value={4}>Nivel 4</option>
                <option value={5}>Nivel 5</option>
                <option value={6}>Nivel 6</option>
                <option value={7}>Nivel 7</option>
                <option value={8}>Nivel 8</option>
                <option value={9}>Nivel 9</option>
                <option value={10}>Nivel 10 (Más bajo - Usuario básico)</option>
              </Select>
              <FormHelperText fontSize='xs'>
                El nivel jerárquico determina los permisos del rol (1 = máximo, 10 = mínimo)
              </FormHelperText>
            </FormControl>
            <Button
              onClick={handleSubmit}
              isLoading={loading}
              variant='dark'
              fontSize='sm'
              fontWeight='bold'
              w='200px'
              h='45px'
              mb='24px'>
              REGISTRAR ROL
            </Button>
          </Flex>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default RegisterRole;
