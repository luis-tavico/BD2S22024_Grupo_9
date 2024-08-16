USE DB2;

CREATE PROCEDURE PR1
    @FirstName NVARCHAR(max),
    @LastName NVARCHAR(max),
    @Email NVARCHAR(max),
    @DateOfBirth DATETIME2(7),
    @Password NVARCHAR(MAX),
    @Credits INT,
AS BEGIN
    BEGIN TRANSACTION;

        BEGIN TRY
            -- Insertar en la tabla Usuarios
            INSERT INTO practica1.Usuarios(FirstName, LastName, Email, DateOfBirth, Password,LastChanges,EmailConfirmed)
            VALUES (@FirstName, @LastName, @Email, @DateOfBirth, @Password, GETDATE(), 1);

            DECLARE @UserId INT;
            SELECT @UserId = SCOPE_IDENTITY();

            -- Asignar rol de estudiante
            INSERT INTO practica1.UsuarioRole (UserId, RoleId)
            VALUES (@UserId, (SELECT Id FROM Roles WHERE RoleName = 'Student'));

            -- Crear perfil de estudiante
            INSERT INTO practica1.ProfileStudent(UserId,Credits)
            VALUES (@UserId,@Credits);

            -- Registrar autenticación de dos factores (inactivo por defecto)
            INSERT INTO practica1.TFA (UserId, Status,LastUpdate)
            VALUES (@UserId, 0,GETDATE());

            -- Enviar notificación al usuario
            INSERT INTO practica1.Notification(UserId, Message)
            VALUES (@UserId, 'Usted ha sido registrado en el sistema exitosamente.');

            COMMIT TRANSACTION;
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            INSERT INTO practica1.HistoryLog(Description)
            VALUES ('Error al registrar usuario en el sistema.');
            THROW;
        END CATCH
END;
GO

------------