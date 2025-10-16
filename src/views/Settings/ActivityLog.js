import React from "react";
import {
  Avatar,
  Badge,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";

function ActivityLog() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const activities = [
    {
      id: 1,
      user: "Juan Pérez",
      action: "Inicio de sesión",
      module: "Autenticación",
      date: "2024-10-15 14:30:25",
      ip: "192.168.1.100",
      type: "info"
    },
    {
      id: 2,
      user: "María García",
      action: "Registro de producto",
      module: "Inventario",
      date: "2024-10-15 14:25:10",
      ip: "192.168.1.101",
      type: "success"
    },
    {
      id: 3,
      user: "Carlos López",
      action: "Intento de acceso fallido",
      module: "Autenticación",
      date: "2024-10-15 14:20:05",
      ip: "192.168.1.102",
      type: "warning"
    },
    {
      id: 4,
      user: "Ana Martínez",
      action: "Eliminación de usuario",
      module: "Usuarios",
      date: "2024-10-15 14:15:30",
      ip: "192.168.1.103",
      type: "error"
    },
    {
      id: 5,
      user: "Luis Rodríguez",
      action: "Actualización de precios",
      module: "Productos",
      date: "2024-10-15 14:10:15",
      ip: "192.168.1.104",
      type: "success"
    },
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case "success": return "green";
      case "warning": return "orange";
      case "error": return "red";
      default: return "blue";
    }
  };

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Bitácora de Actividades
          </Text>
        </CardHeader>
        <CardBody>
          <Table variant='simple' color={textColor}>
            <Thead>
              <Tr>
                <Th borderColor={borderColor} color='gray.400'>Usuario</Th>
                <Th borderColor={borderColor} color='gray.400'>Acción</Th>
                <Th borderColor={borderColor} color='gray.400'>Módulo</Th>
                <Th borderColor={borderColor} color='gray.400'>Fecha y Hora</Th>
                <Th borderColor={borderColor} color='gray.400'>IP</Th>
                <Th borderColor={borderColor} color='gray.400'>Tipo</Th>
              </Tr>
            </Thead>
            <Tbody>
              {activities.map((activity) => (
                <Tr key={activity.id}>
                  <Td borderColor={borderColor}>
                    <Flex align='center'>
                      <Avatar size='sm' name={activity.user} me='10px' />
                      <Text fontSize='sm' fontWeight='bold'>{activity.user}</Text>
                    </Flex>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Text fontSize='sm'>{activity.action}</Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Text fontSize='sm'>{activity.module}</Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Text fontSize='sm'>{activity.date}</Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Text fontSize='sm' fontFamily='monospace'>{activity.ip}</Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Badge
                      colorScheme={getTypeColor(activity.type)}
                      fontSize='sm'
                      p='3px 10px'
                      borderRadius='8px'>
                      {activity.type}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default ActivityLog;
