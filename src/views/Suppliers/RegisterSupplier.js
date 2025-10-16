import React from "react";
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
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";

function RegisterSupplier() {
  const textColor = useColorModeValue("gray.700", "white");

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
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Nombre del Proveedor
                </FormLabel>
                <Input
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
                  Teléfono
                </FormLabel>
                <Input
                  borderRadius='15px'
                  fontSize='sm'
                  type='tel'
                  placeholder='Número de contacto'
                  size='lg'
                />
              </FormControl>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Email
                </FormLabel>
                <Input
                  borderRadius='15px'
                  fontSize='sm'
                  type='email'
                  placeholder='correo@proveedor.com'
                  size='lg'
                />
              </FormControl>
            </Grid>
            <FormControl mb='24px'>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Dirección
              </FormLabel>
              <Input
                borderRadius='15px'
                fontSize='sm'
                type='text'
                placeholder='Dirección completa'
                size='lg'
              />
            </FormControl>
            <FormControl mb='24px'>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Notas
              </FormLabel>
              <Textarea
                borderRadius='15px'
                fontSize='sm'
                placeholder='Información adicional del proveedor'
                rows={3}
              />
            </FormControl>
            <Button
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
