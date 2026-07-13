import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Box, Card, CardContent, Typography, Chip, Avatar, IconButton, CircularProgress } from '@mui/material';
import { MoreVert, AttachMoney, CalendarToday } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { fetchLeads } from '../../api/leadService';

const defaultColumns = {
  'New': [],
  'Attempted Contact': [],
  'Contacted': [],
  'Interested': [],
  'Qualified': [],
  'Proposal Sent': [],
  'Negotiation': [],
  'Won': [],
  'Lost': [],
  'Duplicate': [],
  'Spam': []
};

const LeadPipeline = () => {
  const [columns, setColumns] = useState(defaultColumns);
  
  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['leads', { page: 1, search: '' }],
    queryFn: () => fetchLeads({ page: 1, search: '' }),
  });

  useEffect(() => {
    if (leadsData?.data?.data) {
      const newColumns = { ...defaultColumns };
      leadsData.data.data.forEach(lead => {
        const statusName = lead.status?.name || lead.status || 'New';
        if (!newColumns[statusName]) {
          newColumns[statusName] = [];
        }
        newColumns[statusName].push({
          id: lead.id.toString(), // Draggable requires string ID
          name: lead.name,
          company: lead.company,
          priority: lead.priority || 'Medium',
          value: lead.budget ? `$${lead.budget.toLocaleString()}` : 'N/A'
        });
      });
      setColumns(newColumns);
    }
  }, [leadsData]);

  const onDragEnd = (result) => {
    const { source, destination } = result;
    
    // Dropped outside a column
    if (!destination) return;
    
    // Dropped in same place
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];
    const sourceItems = [...sourceCol];
    const destItems = [...destCol];

    const [removed] = sourceItems.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      // Reordering in same column
      sourceItems.splice(destination.index, 0, removed);
      setColumns(prev => ({ ...prev, [source.droppableId]: sourceItems }));
    } else {
      // Moving to different column
      destItems.splice(destination.index, 0, removed);
      setColumns(prev => ({ 
        ...prev, 
        [source.droppableId]: sourceItems,
        [destination.droppableId]: destItems
      }));
    }
  };

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, minHeight: 'calc(100vh - 300px)' }}>
      <DragDropContext onDragEnd={onDragEnd}>
        {Object.entries(columns).map(([colId, items]) => (
          <Box key={colId} sx={{ minWidth: 320, width: 320, display: 'flex', flexDirection: 'column' }}>
            {/* Column Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 1 }}>
              <Typography variant="subtitle1" fontWeight={700} color="text.secondary" textTransform="uppercase">
                {colId}
              </Typography>
              <Chip label={items.length} size="small" sx={{ fontWeight: 700 }} />
            </Box>

            {/* Droppable Area */}
            <Droppable droppableId={colId}>
              {(provided, snapshot) => (
                <Box
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  sx={{
                    flexGrow: 1,
                    bgcolor: snapshot.isDraggingOver ? 'action.hover' : 'grey.50',
                    borderRadius: 3,
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    minHeight: 150
                  }}
                >
                  {items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          sx={{ 
                            mb: 1.5, 
                            borderRadius: 2, 
                            boxShadow: snapshot.isDragging ? 4 : 1,
                            bgcolor: 'background.paper',
                            transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
                            transition: 'transform 0.2s ease',
                          }}
                        >
                          <CardContent sx={{ p: '16px !important' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Box>
                                <Typography variant="subtitle2" fontWeight={700}>{item.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{item.company}</Typography>
                              </Box>
                              <IconButton size="small" sx={{ mt: -0.5, mr: -1 }}><MoreVert fontSize="small" /></IconButton>
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                              <Chip 
                                label={item.priority} 
                                size="small" 
                                color={item.priority === 'High' ? 'error' : item.priority === 'Medium' ? 'warning' : 'success'} 
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} 
                              />
                              <Typography variant="caption" fontWeight={600} color="primary.main" sx={{ display: 'flex', alignItems: 'center' }}>
                                <AttachMoney fontSize="inherit" /> {item.value}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </Box>
        ))}
      </DragDropContext>
    </Box>
  );
};

export default LeadPipeline;
