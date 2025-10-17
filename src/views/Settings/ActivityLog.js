import React, { useState, useEffect } from "react";
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
  Select,
  Input,
  Button,
  Grid,
  Box,
  Icon,
} from "@chakra-ui/react";
import { FaFilter, FaSync } from "react-icons/fa";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";

function ActivityLog() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const [filterModule, setFilterModule] = useState("");
  const [filterType, setFilterType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredActivities, setFilteredActivities] = useState([]);

  // Simulación de datos - En producción vendría del backend
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

  const getTypeLabel = (type) => {
    switch (type) {
      case "success": return "Exitoso";
      case "warning": return "Advertencia";
      case "error": return "Error";
      default: return "Info";
    }
  };

  // Filtrar actividades
  useEffect(() => {
    let filtered = [...activities];

    if (filterModule) {
      filtered = filtered.filter(a => a.module === filterModule);
    }

    if (filterType) {
      filtered = filtered.filter(a => a.type === filterType);
    }

    if (searchQuery) {
      filtered = filtered.filter(a =>
        a.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.action.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredActivities(filtered);
  }, [filterModule, filterType, searchQuery]);

  const handleReset = () => {
    setFilterModule("");
    setFilterType("");
    setSearchQuery("");
  };

  const displayActivities = filteredActivities.length > 0 ? filteredActivities : activities;

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      {/* Filtros */}
      <Card mb='20px' p='20px'>
        <Flex align='center' mb='16px'>
          <Icon as={FaFilter} me='10px' color='blue.500' />
          <Text fontSize='lg' color={textColor} fontWeight='bold'>
            Filtros
          </Text>
        </Flex>
        <Grid templateColumns={{ sm: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
          <Input
            placeholder='Buscar usuario o acción...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            borderRadius='15px'
            size='lg'
          />
          <Select
            placeholder='Todos los módulos'
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            borderRadius='15px'
            size='lg'>
            <option value='Autenticación'>Autenticación</option>
            <option value='Usuarios'>Usuarios</option>
            <option value='Productos'>Productos</option>
            <option value='Inventario'>Inventario</option>
          </Select>
          <Select
            placeholder='Todos los tipos'
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            borderRadius='15px'
            size='lg'>
            <option value='info'>Info</option>
            <option value='success'>Exitoso</option>
            <option value='warning'>Advertencia</option>
            <option value='error'>Error</option>
          </Select>
          <Button
            leftIcon={<FaSync />}
            onClick={handleReset}
            variant='outline'
            colorScheme='blue'
            borderRadius='15px'
            size='lg'>
            Limpiar
          </Button>
        </Grid>
      </Card>

      {/* Tabla de actividades */}
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Flex justify='space-between' align='center'>
            <Text fontSize='xl' color={textColor} fontWeight='bold'>
              Bitácora de Actividades
            </Text>
            <Badge colorScheme='blue' p='6px 12px' borderRadius='8px'>
              {displayActivities.length} registros
            </Badge>
          </Flex>
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
              {displayActivities.map((activity) => (
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
                      {getTypeLabel(activity.type)}
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
