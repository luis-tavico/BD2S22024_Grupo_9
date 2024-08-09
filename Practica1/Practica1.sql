DROP DATABASE IF EXISTS IngenieriaDB;
GO

CREATE DATABASE IngenieriaDB
GO
USE IngenieriaDB
GO

------------------------------------------------------------------------------------------------------------------------
---------------------------------------------------------Tablas---------------------------------------------------------

---------------------------------------------------------Roles----------------------------------------------------------

CREATE TABLE Roles
(
    Id INT PRIMARY KEY IDENTITY(1,1),
    RoleName NVARCHAR(50) NOT NULL
)
GO

--------------------------------------------------------Usuarios--------------------------------------------------------

CREATE TABLE Usuarios
(
    Id INT PRIMARY KEY IDENTITY(1,1),
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    DateOfBirth DATE NOT NULL,
    Password NVARCHAR(100) NOT NULL,
    Credits INT NOT NULL,
    EmailConfirmed BIT NOT NULL DEFAULT 0
)
GO

-------------------------------------------------------UsuarioRol-------------------------------------------------------

CREATE TABLE UsuarioRole
(
    Id INT PRIMARY KEY IDENTITY(1,1),
	RoleId INT NOT NULL FOREIGN KEY REFERENCES Roles(Id),
    UserId INT NOT NULL FOREIGN KEY REFERENCES Usuarios(Id)
)
GO

-----------------------------------------------------ProfileStudent-----------------------------------------------------

CREATE TABLE ProfileStudent
(
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL FOREIGN KEY REFERENCES Usuarios(Id)
)
GO

----------------------------------------------------------TFA-----------------------------------------------------------

CREATE TABLE TFA
(
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL FOREIGN KEY REFERENCES Usuarios(Id),
    IsActive BIT NOT NULL
)
GO

------------------------------------------------------Notification------------------------------------------------------

CREATE TABLE Notification
(
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL FOREIGN KEY REFERENCES Usuarios(Id),
    Message NVARCHAR(255) NOT NULL,
    DateSent DATETIME NOT NULL DEFAULT GETDATE()
)
GO

---------------------------------------------------------Course---------------------------------------------------------

CREATE TABLE Course
(
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    CreditsRequired INT NOT NULL
)
GO
    
------------------------------------------------------TutorProfile------------------------------------------------------

CREATE TABLE TutorProfile
(
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL FOREIGN KEY REFERENCES Usuarios(Id)
)
GO

------------------------------------------------------CourseTutor-------------------------------------------------------

CREATE TABLE CourseTutor
(
    Id INT PRIMARY KEY IDENTITY(1,1),
    TutorId INT NOT NULL FOREIGN KEY REFERENCES TutorProfile(Id),
    CourseId INT NOT NULL FOREIGN KEY REFERENCES Course(Id)
)
GO

----------------------------------------------------CourseAssignment----------------------------------------------------

CREATE TABLE CourseAssignment
(
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL FOREIGN KEY REFERENCES Usuarios(Id),
    CourseId INT NOT NULL FOREIGN KEY REFERENCES Course(Id)
)
GO

-------------------------------------------------------HistoryLog-------------------------------------------------------

CREATE TABLE HistoryLog
(
    Id INT PRIMARY KEY IDENTITY(1,1),
    Description NVARCHAR(255) NOT NULL,
    DateLogged DATETIME NOT NULL DEFAULT GETDATE()
)
GO

------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------Triggers--------------------------------------------------------

--------------------------------------------------------Trigger1--------------------------------------------------------

CREATE TRIGGER Trigger1
ON Usuarios
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    DECLARE @action NVARCHAR(50);

    IF EXISTS(SELECT * FROM inserted)
    BEGIN
        IF EXISTS(SELECT * FROM deleted)
        BEGIN
            SET @action = 'Accion Actualizar en la tabla Usuarios.';
        END
        ELSE
        BEGIN
            SET @action = 'Accion Insertar en la tabla Usuarios.';
        END
    END
    ELSE
    BEGIN
        SET @action = 'Accion Eliminar en la tabla Usuarios.';
    END

    INSERT INTO HistoryLog (Description)
    VALUES (@action);
END;
GO

------------------------------------------------------------------------------------------------------------------------
-----------------------------------------------Procedimientos Almacenados-----------------------------------------------

----------------------------------------------------------PR1-----------------------------------------------------------

CREATE PROCEDURE PR1
    @FirstName NVARCHAR(50),
    @LastName NVARCHAR(50),
    @Email NVARCHAR(100),
    @DateOfBirth DATE,
    @Password NVARCHAR(100),
    @Credits INT
AS
BEGIN
    BEGIN TRANSACTION;

    BEGIN TRY
        -- Insertar en la tabla Usuarios
        INSERT INTO Usuarios (FirstName, LastName, Email, DateOfBirth, Password, Credits, EmailConfirmed)
        VALUES (@FirstName, @LastName, @Email, @DateOfBirth, @Password, @Credits, 1);

        DECLARE @UserId INT;
        SELECT @UserId = SCOPE_IDENTITY();

        -- Asignar rol de estudiante
        INSERT INTO UsuarioRole (UserId, RoleId)
        VALUES (@UserId, (SELECT Id FROM Roles WHERE RoleName = 'Student'));

        -- Crear perfil de estudiante
        INSERT INTO ProfileStudent (UserId)
        VALUES (@UserId);

        -- Registrar autenticación de dos factores (inactivo por defecto)
        INSERT INTO TFA (UserId, IsActive)
        VALUES (@UserId, 0);

        -- Enviar notificación al usuario
        INSERT INTO Notification (UserId, Message)
        VALUES (@UserId, 'Usted ha sido registrado en el sistema exitosamente.');

        -- Registrar en HistoryLog
        INSERT INTO HistoryLog (Description)
        VALUES ('Usuario registrado en el sistema exitosamente.');

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        INSERT INTO HistoryLog (Description)
        VALUES ('Error al registrar usuario en el sistema.');
        THROW;
    END CATCH
END;
GO

----------------------------------------------------------PR2-----------------------------------------------------------

CREATE PROCEDURE PR2
    @Email NVARCHAR(100),
    @CodCourse INT
AS
BEGIN
    BEGIN TRANSACTION;

    BEGIN TRY
        DECLARE @UserId INT;
        SELECT @UserId = Id FROM Usuarios WHERE Email = @Email AND EmailConfirmed = 1;

        IF @UserId IS NULL
        BEGIN
            THROW 50000, 'Usuario no encontrado o email no confirmado.', 1;
        END

        -- Asignar rol de tutor
        INSERT INTO UsuarioRole (UserId, RoleId)
        VALUES (@UserId, (SELECT Id FROM Roles WHERE RoleName = 'Tutor'));

        -- Crear perfil de tutor
        INSERT INTO TutorProfile (UserId)
        VALUES (@UserId);

        -- Asignar curso al tutor
        INSERT INTO CourseTutor (TutorId, CourseId)
        VALUES ((SELECT Id FROM TutorProfile WHERE UserId = @UserId), @CodCourse);

        -- Enviar notificación al usuario
        INSERT INTO Notification (UserId, Message)
        VALUES (@UserId, 'Usted ha sido promovido a tutor exitosamente.');

        -- Registrar en HistoryLog
        INSERT INTO HistoryLog (Description)
        VALUES ('Usuario cambiado a rol de tutor exitosamente.');

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        INSERT INTO HistoryLog (Description)
        VALUES ('Error al cambiar de rol.');
        THROW;
    END CATCH
END;
GO

----------------------------------------------------------PR3-----------------------------------------------------------

CREATE PROCEDURE PR3
    @Email NVARCHAR(100),
    @CodCourse INT
AS
BEGIN
    BEGIN TRANSACTION;

    BEGIN TRY
        DECLARE @UserId INT;
        SELECT @UserId = Id FROM Usuarios WHERE Email = @Email AND Credits >= (SELECT CreditsRequired FROM Course WHERE Id = @CodCourse);

        IF @UserId IS NULL
        BEGIN
            THROW 50000, 'Usuario no econtrado o creditos insuficientes.', 1;
        END

        -- Asignar curso
        INSERT INTO CourseAssignment (UserId, CourseId)
        VALUES (@UserId, @CodCourse);

        -- Enviar notificación al estudiante
        INSERT INTO Notification (UserId, Message)
        VALUES (@UserId, 'Usted ha sido asignado a un nuevo curso exitosamente.');

        -- Enviar notificación al tutor
        INSERT INTO Notification (UserId, Message)
        VALUES ((SELECT UserId FROM TutorProfile INNER JOIN CourseTutor ON TutorProfile.Id = CourseTutor.TutorId WHERE CourseTutor.CourseId = @CodCourse), 'Un nuevo estudiante ha sido asignado a su curso.');

        -- Registrar en HistoryLog
        INSERT INTO HistoryLog (Description)
        VALUES ('Curso asignado exitosamente.');

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        INSERT INTO HistoryLog (Description)
        VALUES ('Error al asignar curso.');
        THROW;
    END CATCH
END;
GO

----------------------------------------------------------PR4-----------------------------------------------------------

CREATE PROCEDURE PR4
    @RoleName NVARCHAR(50)
AS
BEGIN
    BEGIN TRANSACTION;

    BEGIN TRY
        INSERT INTO Roles (RoleName)
        VALUES (@RoleName);

        -- Registrar en HistoryLog
        INSERT INTO HistoryLog (Description)
        VALUES ('Rol creado exitosamente.');

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        INSERT INTO HistoryLog (Description)
        VALUES ('Error al crear rol.');
        THROW;
    END CATCH
END;
GO

----------------------------------------------------------PR5-----------------------------------------------------------

CREATE PROCEDURE PR5
    @Name NVARCHAR(100),
    @CreditsRequired INT
AS
BEGIN
    BEGIN TRANSACTION;

    BEGIN TRY
        INSERT INTO Course (Name, CreditsRequired)
        VALUES (@Name, @CreditsRequired);

        -- Registrar en HistoryLog
        INSERT INTO HistoryLog (Description)
        VALUES ('Curso creado exitosamente.');

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        INSERT INTO HistoryLog (Description)
        VALUES ('Error al crear curso.');
        THROW;
    END CATCH
END;
GO

----------------------------------------------------------PR6-----------------------------------------------------------

CREATE PROCEDURE PR6
AS
BEGIN
    BEGIN TRANSACTION;

    BEGIN TRY
        -- Validar nombres de usuarios
        IF EXISTS (SELECT * FROM Usuarios WHERE FirstName NOT LIKE '%[^A-Za-z]%') OR EXISTS (SELECT * FROM Usuarios WHERE LastName NOT LIKE '%[^A-Za-z]%')
        BEGIN
            THROW 50000, 'Datos invalidos, debe ingresar solo letras.', 1;
        END

        -- Validar nombres de cursos
        IF EXISTS (SELECT * FROM Course WHERE Name NOT LIKE '%[^A-Za-z]%')
        BEGIN
            THROW 50000, 'Datos invalidos, debe ingresar solo letras.', 1;
        END

		-- Validar creditos de cursos
        IF EXISTS (SELECT * FROM Course WHERE CreditsRequired NOT LIKE '%[^0-9]%')
        BEGIN
            THROW 50000, 'Datos invalidos, debe ingresar solo numeros.', 1;
        END

        -- Registrar en HistoryLog
        INSERT INTO HistoryLog (Description)
        VALUES ('Validacion de datos completada exitosamente.');

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        INSERT INTO HistoryLog (Description)
        VALUES ('Error al validar datos.');
        THROW;
    END CATCH
END;
GO

------------------------------------------------------------------------------------------------------------------------
-------------------------------------------------------Funciones--------------------------------------------------------

-----------------------------------------------------------F1-----------------------------------------------------------

CREATE FUNCTION F1 (@CodCourse INT)
RETURNS TABLE
AS
RETURN
(
    SELECT U.FirstName, U.LastName, U.Email
    FROM Usuarios U
    INNER JOIN CourseAssignment CA ON U.Id = CA.UserId
    WHERE CA.CourseId = @CodCourse
);
GO

-----------------------------------------------------------F2-----------------------------------------------------------

CREATE FUNCTION F2 (@TutorId INT)
RETURNS TABLE
AS
RETURN
(
    SELECT C.Name
    FROM Course C
    INNER JOIN CourseTutor CT ON C.Id = CT.CourseId
    WHERE CT.TutorId = @TutorId
);
GO

-----------------------------------------------------------F3-----------------------------------------------------------

CREATE FUNCTION F3 (@UserId INT)
RETURNS TABLE
AS
RETURN
(
    SELECT N.Message, N.DateSent
    FROM Notification N
    WHERE N.UserId = @UserId
);
GO

-----------------------------------------------------------F4-----------------------------------------------------------

CREATE FUNCTION F4 ()
RETURNS TABLE
AS
RETURN
(
    SELECT Description, DateLogged
    FROM HistoryLog
);
GO

-----------------------------------------------------------F5-----------------------------------------------------------

CREATE FUNCTION F5 (@UserId INT)
RETURNS TABLE
AS
RETURN
(
    SELECT U.FirstName, U.LastName, U.Email, U.DateOfBirth, U.Credits, R.RoleName
    FROM Usuarios U
    INNER JOIN UsuarioRole UR ON U.Id = UR.UserId
    INNER JOIN Roles R ON UR.RoleId = R.Id
    WHERE U.Id = @UserId
);
GO

-----------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------Pruebas--------------------------------------------------------


-- Crear roles
EXEC PR4 @RoleName = 'Student';
EXEC PR4 @RoleName = 'Tutor';

-- Registrar usuarios
EXEC PR1 @FirstName = 'Luis', @LastName = 'Perez', @Email = 'luis@example.com', @DateOfBirth = '1990-01-01', @Password = 'password123', @Credits = 10;
EXEC PR1 @FirstName = 'Maria', @LastName = 'Lopez', @Email = 'maria@example.com', @DateOfBirth = '1992-05-15', @Password = 'password456', @Credits = 20;
EXEC PR1 @FirstName = 'Carlos', @LastName = 'Mendez', @Email = 'carlos@example.com', @DateOfBirth = '1988-09-23', @Password = 'password789', @Credits = 15;
EXEC PR1 @FirstName = 'Sofia', @LastName = 'Morales', @Email = 'anonimo@example.com', @DateOfBirth = '1995-09-23', @Password = 'password000', @Credits = 5;

-- Crear cursos
EXEC PR5 @Name = 'Matematica Basica 2', @CreditsRequired = 10;
EXEC PR5 @Name = 'Fisica Basica', @CreditsRequired = 15;
EXEC PR5 @Name = 'Social Humanistica 2', @CreditsRequired = 20;

-- Promover a tutor y asignar curso
EXEC PR2 @Email = 'carlos@example.com', @CodCourse = 1; -- Carlos como tutor de Matematica Basica 2
EXEC PR2 @Email = 'maria@example.com', @CodCourse = 2; -- Maria como tutor de Fisica Basica

-- Asignar cursos a estudiantes
EXEC PR3 @Email = 'luis@example.com', @CodCourse = 1; -- Luis asignado a Matematica Basica 2
EXEC PR3 @Email = 'maria@example.com', @CodCourse = 1; -- Maria asignado a Matematica Basica 2
EXEC PR3 @Email = 'carlos@example.com', @CodCourse = 2; -- Carlos asignado a Fisica Basica

-- Validar datos
EXEC PR6;

-- Listar alumnos asignados a Matematica Basica 2
SELECT * FROM F1(1);

-- Listar alumnos asignados a Fisica Basica
SELECT * FROM F1(2);

-- Listar cursos asignados a Carlos
SELECT * FROM F2((SELECT Id FROM TutorProfile WHERE UserId = (SELECT Id FROM Usuarios WHERE Email = 'carlos@example.com')));

-- Listar cursos asignados a Maria
SELECT * FROM F2((SELECT Id FROM TutorProfile WHERE UserId = (SELECT Id FROM Usuarios WHERE Email = 'maria@example.com')));

-- Listar notificaciones de Luis
SELECT * FROM F3((SELECT Id FROM Usuarios WHERE Email = 'luis@example.com'));

-- Listar notificaciones de Carlos
SELECT * FROM F3((SELECT Id FROM Usuarios WHERE Email = 'carlos@example.com'));

-- Listar logs de historial
SELECT * FROM F4();

-- Listar expediente de Luis
SELECT * FROM F5((SELECT Id FROM Usuarios WHERE Email = 'luis@example.com'));

-- Listar expediente de Maria
SELECT * FROM F5((SELECT Id FROM Usuarios WHERE Email = 'maria@example.com'));

-- Ver tablas
SELECT * FROM Roles;
SELECT * FROM Usuarios;
SELECT * FROM UsuarioRole;
SELECT * FROM ProfileStudent;
SELECT * FROM TFA;
SELECT * FROM Notification;
SELECT * FROM Course;
SELECT * FROM TutorProfile;
SELECT * FROM CourseTutor;
SELECT * FROM CourseAssignment;
SELECT * FROM HistoryLog;