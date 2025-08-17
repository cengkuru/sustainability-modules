import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminComponent } from './admin.component';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';
import { User } from '../../services/user.service';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockUsers: User[] = [
    {
      _id: '1',
      uid: 'uid1',
      email: 'admin@example.com',
      name: 'Admin User',
      roles: ['admin'],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '2',
      uid: 'uid2',
      email: 'hod@example.com',
      name: 'HOD User',
      roles: ['hod'],
      agency: 'Test Agency',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '3',
      uid: 'uid3',
      email: 'user@example.com',
      name: 'Regular User',
      roles: ['user'],
      agency: 'Another Agency',
      status: 'inactive',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  beforeEach(async () => {
    const userSpy = jasmine.createSpyObj('UserService', [
      'getUsers',
      'getUserById',
      'createUser',
      'updateUser',
      'deleteUser'
    ]);
    const authSpy = jasmine.createSpyObj('AuthService', ['isAdmin']);

    await TestBed.configureTestingModule({
      imports: [AdminComponent],
      providers: [
        { provide: UserService, useValue: userSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should fetch users on initialization', () => {
      userServiceSpy.getUsers.and.returnValue(of(mockUsers));
      authServiceSpy.isAdmin.and.returnValue(true);

      component.ngOnInit();

      expect(userServiceSpy.getUsers).toHaveBeenCalled();
      expect(component.users).toEqual(mockUsers);
      expect(component.isLoading).toBe(false);
      expect(component.error).toBeNull();
    });

    it('should handle error when fetching users fails', () => {
      const errorMessage = 'Failed to fetch users';
      userServiceSpy.getUsers.and.returnValue(throwError(() => new Error(errorMessage)));

      component.ngOnInit();

      expect(component.error).toBe(errorMessage);
      expect(component.isLoading).toBe(false);
      expect(component.users).toEqual([]);
    });
  });

  describe('fetchUsers', () => {
    it('should refresh user list', () => {
      userServiceSpy.getUsers.and.returnValue(of(mockUsers));

      component.fetchUsers();

      expect(component.isLoading).toBe(false);
      expect(component.users).toEqual(mockUsers);
      expect(component.error).toBeNull();
    });

    it('should handle errors during refresh', () => {
      userServiceSpy.getUsers.and.returnValue(throwError(() => new Error('Network error')));

      component.fetchUsers();

      expect(component.error).toBe('Network error');
      expect(component.isLoading).toBe(false);
    });
  });

  describe('getUserRole', () => {
    it('should return admin for admin role', () => {
      const role = component.getUserRole(mockUsers[0]);
      expect(role).toBe('admin');
    });

    it('should return hod for hod role', () => {
      const role = component.getUserRole(mockUsers[1]);
      expect(role).toBe('hod');
    });

    it('should return user for user role', () => {
      const role = component.getUserRole(mockUsers[2]);
      expect(role).toBe('user');
    });

    it('should return user for empty roles array', () => {
      const userWithNoRoles: User = { ...mockUsers[0], roles: [] };
      const role = component.getUserRole(userWithNoRoles);
      expect(role).toBe('user');
    });
  });

  describe('onRoleChange', () => {
    beforeEach(() => {
      component.users = [...mockUsers];
    });

    it('should update user to admin role', () => {
      const updatedUser = { ...mockUsers[2], roles: ['admin'] };
      userServiceSpy.updateUser.and.returnValue(of(updatedUser));

      const event = { target: { value: 'admin' } } as any;
      component.onRoleChange('3', event);

      expect(userServiceSpy.updateUser).toHaveBeenCalledWith('3', { roles: ['admin'] });
    });

    it('should update user to hod role', () => {
      const updatedUser = { ...mockUsers[2], roles: ['hod'] };
      userServiceSpy.updateUser.and.returnValue(of(updatedUser));

      const event = { target: { value: 'hod' } } as any;
      component.onRoleChange('3', event);

      expect(userServiceSpy.updateUser).toHaveBeenCalledWith('3', { roles: ['hod'] });
    });

    it('should handle role update errors', () => {
      userServiceSpy.updateUser.and.returnValue(throwError(() => new Error('Update failed')));
      userServiceSpy.getUsers.and.returnValue(of(mockUsers));

      const event = { target: { value: 'admin' } } as any;
      component.onRoleChange('3', event);

      expect(component.error).toBe('Update failed');
      expect(userServiceSpy.getUsers).toHaveBeenCalled();
    });
  });

  describe('onStatusChange', () => {
    it('should update user status to active', () => {
      const updatedUser = { ...mockUsers[2], status: 'active' as const };
      userServiceSpy.updateUser.and.returnValue(of(updatedUser));

      const event = { target: { value: 'active' } } as any;
      component.onStatusChange('3', event);

      expect(userServiceSpy.updateUser).toHaveBeenCalledWith('3', { status: 'active' });
    });

    it('should update user status to inactive', () => {
      const updatedUser = { ...mockUsers[0], status: 'inactive' as const };
      userServiceSpy.updateUser.and.returnValue(of(updatedUser));

      const event = { target: { value: 'inactive' } } as any;
      component.onStatusChange('1', event);

      expect(userServiceSpy.updateUser).toHaveBeenCalledWith('1', { status: 'inactive' });
    });
  });

  describe('deleteUser', () => {
    beforeEach(() => {
      component.users = [...mockUsers];
    });

    it('should delete user when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      userServiceSpy.deleteUser.and.returnValue(of(void 0));

      component.deleteUser('2');

      expect(userServiceSpy.deleteUser).toHaveBeenCalledWith('2');
      expect(component.users.length).toBe(2);
      expect(component.users.find(u => u._id === '2')).toBeUndefined();
    });

    it('should not delete user when cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteUser('2');

      expect(userServiceSpy.deleteUser).not.toHaveBeenCalled();
      expect(component.users.length).toBe(3);
    });

    it('should handle delete errors', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      userServiceSpy.deleteUser.and.returnValue(throwError(() => new Error('Delete failed')));

      component.deleteUser('2');

      expect(component.error).toBe('Delete failed');
      expect(component.users.length).toBe(3);
    });
  });

  describe('createUser', () => {
    beforeEach(() => {
      component.newUser = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        roles: ['user'],
        agency: 'New Agency'
      };
    });

    it('should create user successfully', () => {
      const createdUser: User = {
        _id: '4',
        uid: 'uid4',
        email: 'new@example.com',
        name: 'New User',
        roles: ['user'],
        agency: 'New Agency',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      userServiceSpy.createUser.and.returnValue(of(createdUser));
      component.users = [...mockUsers];

      component.createUser();

      expect(userServiceSpy.createUser).toHaveBeenCalledWith(component.newUser);
      expect(component.users.length).toBe(4);
      expect(component.showCreateModal).toBe(false);
      expect(component.newUser.email).toBe('');
    });

    it('should validate required fields', () => {
      component.newUser.email = '';
      
      component.createUser();

      expect(component.error).toBe('Please fill in all required fields');
      expect(userServiceSpy.createUser).not.toHaveBeenCalled();
    });

    it('should handle creation errors', () => {
      userServiceSpy.createUser.and.returnValue(throwError(() => new Error('Email already exists')));

      component.createUser();

      expect(component.error).toBe('Email already exists');
      expect(component.showCreateModal).toBe(true);
    });
  });

  describe('resetNewUserForm', () => {
    it('should reset the new user form', () => {
      component.newUser = {
        email: 'test@example.com',
        password: 'test123',
        name: 'Test',
        roles: ['admin'],
        agency: 'Test Agency'
      };

      component.resetNewUserForm();

      expect(component.newUser).toEqual({
        email: '',
        password: '',
        name: '',
        roles: ['user'],
        agency: ''
      });
    });
  });

  describe('isAdmin', () => {
    it('should return true if user is admin', () => {
      authServiceSpy.isAdmin.and.returnValue(true);
      expect(component.isAdmin).toBe(true);
    });

    it('should return false if user is not admin', () => {
      authServiceSpy.isAdmin.and.returnValue(false);
      expect(component.isAdmin).toBe(false);
    });
  });
});