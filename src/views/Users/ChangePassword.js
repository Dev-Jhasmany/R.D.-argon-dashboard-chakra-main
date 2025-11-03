import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  useColorModeValue,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import authService from "services/authService";

function ChangePassword() {
  const textColor = useColorModeValue("gray.700", "white");
  const toast = useToast();

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
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
    // Validaciones
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La nueva contraseña debe tener al menos 6 caracteres",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    setLoading(true);
    const result = await authService.changePassword(formData.oldPassword, formData.newPassword);
    setLoading(false);

    if (result.success) {
      toast({
        title: "Contraseña actualizada",
        description: "Su contraseña ha sido cambiada correctamente",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      // Limpiar el formulario
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px' maxW='600px' mx='auto'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Cambio de Contraseña
          </Text>
        </CardHeader>
        <CardBody>
          <Flex direction='column' w='100%'>
            <Alert status='info' mb='20px' borderRadius='8px'>
              <AlertIcon />
              <AlertDescription fontSize='sm'>
                La nueva contraseña debe tener al menos 6 caracteres.
              </AlertDescription>
            </Alert>

            <FormControl mb='24px'>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Contraseña Actual
              </FormLabel>
              <Input
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                borderRadius='15px'
                fontSize='sm'
                type='password'
                placeholder='Ingrese su contraseña actual'
                size='lg'
              />
            </FormControl>
            <FormControl mb='24px'>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Nueva Contraseña
              </FormLabel>
              <Input
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                borderRadius='15px'
                fontSize='sm'
                type='password'
                placeholder='Ingrese nueva contraseña'
                size='lg'
              />
            </FormControl>
            <FormControl mb='24px'>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Confirmar Nueva Contraseña
              </FormLabel>
              <Input
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                borderRadius='15px'
                fontSize='sm'
                type='password'
                placeholder='Confirme nueva contraseña'
                size='lg'
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
              CAMBIAR CONTRASEÑA
            </Button>
          </Flex>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default ChangePassword;
