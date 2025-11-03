import React, { useState } from "react";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
  Switch,
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import supplierService from "services/supplierService";

function RegisterSupplier() {
  const textColor = useColorModeValue("gray.700", "white");
  const toast = useToast();

  const [formData, setFormData] = useState({
    company_name: "",
    ruc: "",
    contact_person: "",
    email: "",
    phone_number: "",
    address: "",
    description: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      is_active: e.target.checked,
    }));
  };

  const handleSubmit = async () => {
    // Validación
    if (!formData.company_name) {
      toast({
        title: "Error",
        description: "El nombre de la empresa es requerido",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    setLoading(true);

    const result = await supplierService.createSupplier(formData);

    setLoading(false);

    if (result.success) {
      toast({
        title: "Proveedor registrado",
        description: "El proveedor ha sido registrado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      // Limpiar formulario
      setFormData({
        company_name: "",
        ruc: "",
        contact_person: "",
        email: "",
        phone_number: "",
        address: "",
        description: "",
        is_active: true,
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
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Registrar Proveedor
          </Text>
        </CardHeader>
        <CardBody>
          <Flex direction='column' w='100%'>
            <Grid templateColumns='repeat(2, 1fr)' gap={6} mb='24px'>
              <FormControl isRequired>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Nombre de la Empresa
                </FormLabel>
                <Input
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  borderRadius='15px'
                  fontSize='sm'
                  type='text'
                  placeholder='Nombre de la empresa'
                  size='lg'
                />
              </FormControl>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  RUC/NIT
                </FormLabel>
                <Input
                  name="ruc"
                  value={formData.ruc}
                  onChange={handleChange}
                  borderRadius='15px'
                  fontSize='sm'
                  type='text'
                  placeholder='Número de identificación'
                  size='lg'
                />
              </FormControl>
            </Grid>
            <Grid templateColumns='repeat(2, 1fr)' gap={6} mb='24px'>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Persona de Contacto
                </FormLabel>
                <Input
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  borderRadius='15px'
                  fontSize='sm'
                  type='text'
                  placeholder='Nombre del contacto'
                  size='lg'
                />
              </FormControl>
              <FormControl>
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
                  placeholder='correo@proveedor.com'
                  size='lg'
                />
              </FormControl>
            </Grid>
            <Grid templateColumns='repeat(2, 1fr)' gap={6} mb='24px'>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Teléfono
                </FormLabel>
                <Input
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  borderRadius='15px'
                  fontSize='sm'
                  type='tel'
                  placeholder='Número de contacto'
                  size='lg'
                />
              </FormControl>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Dirección
                </FormLabel>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  borderRadius='15px'
                  fontSize='sm'
                  type='text'
                  placeholder='Dirección completa'
                  size='lg'
                />
              </FormControl>
            </Grid>
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
                placeholder='Información adicional del proveedor'
                rows={3}
              />
            </FormControl>
            <FormControl display='flex' alignItems='center' mb='24px'>
              <FormLabel htmlFor='is_active' mb='0' fontSize='sm' fontWeight='normal'>
                Estado Activo
              </FormLabel>
              <Switch
                id='is_active'
                isChecked={formData.is_active}
                onChange={handleSwitchChange}
                colorScheme='teal'
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
              REGISTRAR PROVEEDOR
            </Button>
          </Flex>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default RegisterSupplier;
