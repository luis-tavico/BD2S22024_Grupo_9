USE BD2;

CREATE PROCEDURE PR1
(
    @FirstName NVARCHAR(max),
    @LastName NVARCHAR(max),
    @Email NVARCHAR(max),
    @DateOfBirth DATETIME2(7),
    @Password NVARCHAR(MAX),
    @Credits INT
)
AS
BEGIN
    BEGIN TRANSACTION

        BEGIN TRY
            IF @Firstname = '' OR @Lastname = '' OR @Email = '' OR @DateOfBirth IS NULL OR @Password = '' OR @Credits IS NULL
            BEGIN
                RAISERROR ('Todos los campos son obligatorios.', 16, 1);
                RETURN;
            END

            IF @Firstname LIKE '%[^A-Za-z]%' AND @Lastname LIKE '%[^A-Za-z]%'
                BEGIN
                    RAISERROR ('El nombre y apellido solo pueden contener letras.', 16, 1);
                    RETURN;
                END
            
            IF @Email LIKE '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
                --'%_@__%.__%'
                BEGIN
                    RAISERROR ('El formato del correo electrónico no es válido.', 16, 1);
                    RETURN;
                END

            IF  EXISTS(SELECT * FROM practica1.Usuarios WHERE Email=@Email)
                BEGIN
                    RAISERROR ('El correo electrónico ya existe.', 16, 1);
                    RETURN;
                END

            DECLARE @UserId UNIQUEIDENTIFIER;
            SET @UserId = NEWID();
            -- Insertar en la tabla Usuarios
            INSERT INTO practica1.Usuarios(Id,FirstName, LastName, Email, DateOfBirth, Password,LastChanges,EmailConfirmed)
            VALUES (@UserId,@FirstName, @LastName, @Email, @DateOfBirth, @Password, GETDATE(), 1);

            
            -- SET @UserId = last_insert_id();

            -- Asignar rol de estudiante
            INSERT INTO practica1.UsuarioRole (UserId, RoleId,IsLatestVersion)
            VALUES (@UserId, (SELECT Id FROM practica1.Roles WHERE RoleName = 'Student'),0);

            -- Crear perfil de estudiante
            INSERT INTO practica1.ProfileStudent(UserId,Credits)
            VALUES (@UserId,@Credits);

            -- Registrar autenticación de dos factores (inactivo por defecto)
            INSERT INTO practica1.TFA (UserId, Status,LastUpdate)
            VALUES (@UserId, 0,GETDATE());

            -- Enviar notificación al usuario
            INSERT INTO practica1.Notification(UserId, Message,Date)
            VALUES (@UserId, 'Usted ha sido registrado en el sistema exitosamente.',GETDATE());

            COMMIT TRANSACTION;
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            INSERT INTO practica1.HistoryLog(Date,Description)
            VALUES (GETDATE(),'Error al registrar usuario en el sistema.');
            THROW;
        END CATCH
END;
GO

------------
CREATE PROCEDURE PR4
    @RoleName NVARCHAR(MAX)
AS
BEGIN
    BEGIN TRANSACTION;

    BEGIN TRY
        
        IF @RoleName = ''
        BEGIN
            RAISERROR ('Todos los campos son obligatorios.', 16, 1);
            RETURN;
        END

        IF @RoleName LIKE '%[^A-Za-z]%'
            BEGIN
                RAISERROR ('El RoleName solo pueden contener letras.', 16, 1);
                RETURN;
            END

        DECLARE @RolId UNIQUEIDENTIFIER;
        SET @RolId = NEWID();
        INSERT INTO practica1.Roles(Id,RoleName)
        VALUES (@RolId,@RoleName);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        INSERT INTO practica1.HistoryLog (Date,Description)
        VALUES (GETDATE(),'Error al crear rol.');
        THROW;
    END CATCH
END;
GO

EXEC PR4 @RoleName = 'Student';
EXEC PR4 @RoleName = 'Tutor';

EXEC PR1 @FirstName = 'Luis', @LastName = 'Perez', @Email = 'luis@example.com', @DateOfBirth = '1990-01-01', @Password = 'password123', @Credits = 10;