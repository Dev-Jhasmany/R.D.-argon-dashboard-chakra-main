import React from "react";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  Textarea,
  useColorModeValue,
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";

function RegisterRole() {
  const textColor = useColorModeValue("gray.700", "white");

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Registrar Rol
          </Text>
        </CardHeader>
        <CardBody>
          <Flex direction='column' w='100%'>
            <FormControl mb='24px'>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Nombre del Rol
              </FormLabel>
              <Input
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
                borderRadius='15px'
                fontSize='sm'
                placeholder='Descripción del rol y sus responsabilidades'
                rows={4}
              />
            </FormControl>
            <Button
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
