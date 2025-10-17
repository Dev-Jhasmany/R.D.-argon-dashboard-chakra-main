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
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import groupService from "services/groupService";

function RegisterGroup() {
  const textColor = useColorModeValue("gray.700", "white");
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validación
    if (!formData.name) {
      toast({
        title: "Error",
        description: "Por favor ingrese el nombre del grupo",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    const result = await groupService.createGroup(formData);
    setLoading(false);

    if (result.success) {
      toast({
        title: "Grupo registrado",
        description: "El grupo ha sido registrado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Limpiar formulario
      setFormData({
        name: "",
        description: "",
      });
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

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px' maxW='800px' mx='auto'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Registrar Grupo
          </Text>
        </CardHeader>
        <CardBody>
          <Flex direction='column' w='100%'>
            <FormControl mb='24px' isRequired>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Nombre del Grupo
              </FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                borderRadius='15px'
                fontSize='sm'
                type='text'
                placeholder='Ej: Gerencia, Ventas, Logística'
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
                placeholder='Descripción del grupo y sus funciones'
                rows={4}
              />
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
              REGISTRAR GRUPO
            </Button>
          </Flex>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default RegisterGroup;
