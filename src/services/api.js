// API service for communicating with the backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get stored token
  getToken() {
    return localStorage.getItem('token');
  }

  // Set authorization header
  getHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email, motDePasse) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, motDePasse })
    });

    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // User methods
  async getUsers() {
    return this.request('/users');
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE'
    });
  }

  // Class methods
  async getClasses() {
    return this.request('/classes');
  }

  async createClass(classData) {
    return this.request('/classes', {
      method: 'POST',
      body: JSON.stringify(classData)
    });
  }

  async updateClass(id, classData) {
    return this.request(`/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(classData)
    });
  }

  async deleteClass(id) {
    return this.request(`/classes/${id}`, {
      method: 'DELETE'
    });
  }

  // Student methods
  async getStudents() {
    return this.request('/students');
  }

  async getStudent(id) {
    return this.request(`/students/${id}`);
  }

  async createStudent(studentData) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  }

  async updateStudent(id, studentData) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData)
    });
  }

  async deleteStudent(id) {
    return this.request(`/students/${id}`, {
      method: 'DELETE'
    });
  }

  // Payment methods
  async getPayments() {
    return this.request('/payments');
  }

  async getPaymentsByStudent(studentId) {
    return this.request(`/payments/student/${studentId}`);
  }

  async createPayment(paymentData) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async updatePayment(id, paymentData) {
    return this.request(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(paymentData)
    });
  }

  async deletePayment(id) {
    return this.request(`/payments/${id}`, {
      method: 'DELETE'
    });
  }

  // Grade methods
  async getGrades() {
    return this.request('/grades');
  }

  async getGradesByStudent(studentId) {
    return this.request(`/grades/student/${studentId}`);
  }

  async createOrUpdateGrade(gradeData) {
    return this.request('/grades', {
      method: 'POST',
      body: JSON.stringify(gradeData)
    });
  }

  async deleteGrade(id) {
    return this.request(`/grades/${id}`, {
      method: 'DELETE'
    });
  }

  // Subject methods
  async getMatieres() {
    return this.request('/matieres');
  }

  async createMatiere(matiereData) {
    return this.request('/matieres', {
      method: 'POST',
      body: JSON.stringify(matiereData)
    });
  }

  async updateMatiere(id, matiereData) {
    return this.request(`/matieres/${id}`, {
      method: 'PUT',
      body: JSON.stringify(matiereData)
    });
  }

  async deleteMatiere(id) {
    return this.request(`/matieres/${id}`, {
      method: 'DELETE'
    });
  }

  // Fees methods
  async getFees() {
    return this.request('/frais');
  }

  async updateFees(feesData) {
    return this.request('/frais', {
      method: 'PUT',
      body: JSON.stringify(feesData)
    });
  }
}

// Create and export a single instance
const apiService = new ApiService();
export default apiService;