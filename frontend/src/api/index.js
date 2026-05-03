import axios from 'axios';

const BASE = 'http://localhost:5000/api';

export const fetchWorkItems = () =>
  axios.get(`${BASE}/workitems`).then(r => r.data);

export const fetchWorkItem = (id) =>
  axios.get(`${BASE}/workitems/${id}`).then(r => r.data);

export const fetchSignals = (workItemId) =>
  axios.get(`${BASE}/signals/${workItemId}`).then(r => r.data);

export const updateStatus = (id, status) =>
  axios.patch(`${BASE}/workitems/${id}/status`, { status }).then(r => r.data);

export const submitRCA = (id, data) =>
  axios.post(`${BASE}/workitems/${id}/rca`, data).then(r => r.data);