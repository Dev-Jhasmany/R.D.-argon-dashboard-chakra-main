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

function RegisterGroup() {
  const textColor = useColorModeValue("gray.700", "white");

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Registrar Grupo
          </Text>
        </CardHeader>
        <CardBody>
          <Flex direction='column' w='100%'>
            <FormControl mb='24px'>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Nombre del Grupo
              </FormLabel>
              <Input
                borderRadius='15px'
                fontSize='sm'
                type='text'
                placeholder='Ej: Ventas, Almacén, Administración'
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
                placeholder='Descripción del grupo y su función'
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
              REGISTRAR GRUPO
            </Button>
          </Flex>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default RegisterGroup;
