package com.MediFlow.backend.service;

import com.MediFlow.backend.entity.Department;
import com.MediFlow.backend.exception.ResourceNotFoundException;
import com.MediFlow.backend.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public List<Department> findAll() {
        return departmentRepository.findAll();
    }

    public Department findById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", id));
    }

    public Department findByCode(String code) {
        return departmentRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Department not found with code: " + code));
    }

    public Department create(Department department) {
        if (departmentRepository.existsByCode(department.getCode())) {
            throw new IllegalArgumentException("Department code already exists: " + department.getCode());
        }
        if (departmentRepository.existsByName(department.getName())) {
            throw new IllegalArgumentException("Department name already exists: " + department.getName());
        }
        return departmentRepository.save(department);
    }

    public Department update(Long id, Department updatedDepartment) {
        Department department = findById(id);
        department.setName(updatedDepartment.getName());
        department.setCode(updatedDepartment.getCode());
        department.setDescription(updatedDepartment.getDescription());
        return departmentRepository.save(department);
    }

    public void delete(Long id) {
        Department department = findById(id);
        departmentRepository.delete(department);
    }
}
