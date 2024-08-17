USE BD2;

--- ***********************
--  *  Procedimiento PR1  *
--  ***********************

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

            IF PATINDEX('%[^A-Za-z ]%',@Firstname)>0 OR PATINDEX('%[^A-Za-z ]%',@Lastname)>0
                BEGIN
                    RAISERROR ('El nombre y apellido solo pueden contener letras.', 16, 1);
                    RETURN;
                END
            
            IF @Email NOT LIKE '_%@__%.__%'
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

--- ***********************
--  *  Procedimiento PR2  *
--  ***********************


CREATE PROCEDURE PR2
    @Email NVARCHAR(max),
    @CodCourse INT
AS
BEGIN
    BEGIN TRANSACTION;

        BEGIN TRY
            IF @Email = '' OR @CodCourse IS NULL
                BEGIN
                    RAISERROR ('Todos los campos son obligatorios.', 16, 1);
                END    

            IF @Email NOT LIKE '_%@__%.__%'
            --'%_@__%.__%'
            BEGIN
                RAISERROR ('El formato del correo electrónico no es válido.', 16, 1);
                RETURN;
            END



            DECLARE @UserId UNIQUEIDENTIFIER;
            SELECT @UserId = Id FROM practica1.Usuarios WHERE Email = @Email AND EmailConfirmed = 1;

            IF @UserId IS NULL
            BEGIN
                RAISERROR ('Usuario no encontrado o email no confirmado.', 16, 1);
                RETURN;
            END

            -- Asignar rol de tutor
            INSERT INTO practica1.UsuarioRole ( RoleId,UserId,IsLatestVersion)
            VALUES ((SELECT Id FROM practica1.Roles WHERE RoleName = 'Tutor'),@UserId,0);


            DECLARE @tutorId INT,@uniquecode NVARCHAR(max);
            SELECT @tutorId = SCOPE_IDENTITY();
            SET @uniquecode= CAST(NEWID() AS NVARCHAR(36))
            -- Crear perfil de tutor
            INSERT INTO practica1.TutorProfile (UserId,TutorCode)
            VALUES (@UserId,@uniquecode);

            -- Asignar curso al tutor
            INSERT INTO practica1.CourseTutor (TutorId, CourseCodCourse)
            VALUES (@UserId, @CodCourse);

            -- Enviar notificación al usuario
            INSERT INTO practica1.Notification (UserId, Message, Date)
            VALUES (@UserId, 'Usted ha sido promovido a tutor exitosamente.',GETDATE());

            -- Registrar en HistoryLog
            -- INSERT INTO HistoryLog (Description)
            -- VALUES ('Usuario cambiado a rol de tutor exitosamente.');

            COMMIT TRANSACTION;
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            INSERT INTO practica1.HistoryLog(Description,[Date])
            VALUES ('Error al cambiar de rol.',GETDATE());
            THROW;
        END CATCH
END;
GO


--- ***********************
--  *  Procedimiento PR3  *
--  ***********************

CREATE PROCEDURE PR3
    @Email NVARCHAR(100),
    @CodCourse INT
AS
BEGIN
    BEGIN TRANSACTION;

        BEGIN TRY
        
            IF @Email = '' OR @CodCourse IS NULL
                BEGIN
                    RAISERROR ('Todos los campos son obligatorios.', 16, 1);
                END    

            IF @Email NOT LIKE '_%@__%.__%'
            --'%_@__%.__%'
                BEGIN
                    RAISERROR ('El formato del correo electrónico no es válido.', 16, 1);
                    RETURN;
                END

            IF ISNUMERIC(@CodCourse)=0
                BEGIN
                    RAISERROR ('El codigo del curso tiene que ser de tipo numerico.', 16, 1);
                END 

            DECLARE @UserId UNIQUEIDENTIFIER, @Credits INT, @CreditsCurs INT;
            
            SELECT @UserId=U.Id,@Credits=PS.Credits FROM practica1.Usuarios as U
            INNER JOIN practica1.ProfileStudent as PS ON PS.UserId= U.Id
            WHERE U.Email=@Email;

            SELECT @CreditsCurs=CreditsRequired FROM practica1.Course C WHERE C.CodCourse=@CodCourse;

            IF @UserId IS NULL
                BEGIN
                    THROW 50000, 'Usuario no econtrado o creditos insuficientes.', 1;
                END

            IF @CreditsCurs < @Credits
                BEGIN
                    RAISERROR ('No tienes los suficientes creditos para asignarte.', 16, 1);
                    RETURN
                END             

            -- Asignar curso
            INSERT INTO practica1.CourseAssignment (StudentId, CourseCodCourse)
            VALUES (@UserId, @CodCourse);
            PRINT @UserId

            -- Enviar notificación al estudiante
            INSERT INTO practica1.Notification (UserId, Message,Date)
            VALUES (@UserId, 'Usted ha sido asignado a un nuevo curso exitosamente.',GETDATE());

            -- Enviar notificación al tutor
            --INSERT INTO practica1.Notification (UserId, Message,Date)
           -- VALUES ((SELECT TutorCode FROM practica1.TutorProfile T INNER JOIN practica1.CourseTutor C ON T.TutorCode= CAST(C.TutorId AS NVARCHAR(36)) WHERE C.CourseCodCourse = @CodCourse), 'Un nuevo estudiante ha sido asignado a su curso.',GETDATE());

            COMMIT TRANSACTION;
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            INSERT INTO practica1.HistoryLog (Description,Date)
            VALUES ('Error al asignar curso.',GETDATE());
            THROW;
        END CATCH
END;
GO

--- ***********************
--  *  Procedimiento PR4  *
--  ***********************


--- ***********************
--  *  Procedimiento PR5  *
--  ***********************


--- ***********************
--  *  Procedimiento PR6  *
--  ***********************
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

        IF PATINDEX('%[^A-Za-z ]%',@RoleName)>0 
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

-- CREAR USUARIOS
EXEC PR1 @FirstName = 'Luis', @LastName = 'Perez', @Email = 'luisa@example.com', @DateOfBirth = '1990-01-01', @Password = 'password123', @Credits = 10;
EXEC PR1 @FirstName = 'Maria', @LastName = 'Lopez', @Email = 'maria@example.com', @DateOfBirth = '1992-05-15', @Password = 'password456', @Credits = 20;
EXEC PR1 @FirstName = 'Sofia', @LastName = 'Morales', @Email = 'anonimo@example.com', @DateOfBirth = '1995-09-23', @Password = 'password000', @Credits = 15;
-- asignacionde tutor
EXEC PR2 @Email = 'luisa@example.com', @CodCourse = 970; -- Carlos como tutor de Matematica

-- Asignar cursos a estudiantes
EXEC PR3 @Email = 'maria@example.com', @CodCourse = 970; 
EXEC PR3 @Email = 'anonimo@example.com', @CodCourse = 970; 