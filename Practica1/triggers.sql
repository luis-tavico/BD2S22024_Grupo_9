USE BD2;

CREATE TRIGGER Trigger1 
ON practica1.Usuarios
AFTER INSERT,UPDATE,DELETE
AS
BEGIN
    SET NOCOUNT ON
    DECLARE @procedureName VARCHAR(75),@sms VARCHAR(MAX), @id uniqueidentifier;
    SET @procedureName =OBJECT_NAME(@@PROCID); 
    PRINT @procedureName 
    IF EXISTS(SELECT * FROM INSERTED) AND EXISTS(SELECT * FROM DELETED)
        BEGIN
            SELECT @id=Id FROM INSERTED
            SET @sms='Se ha modificado el usuario con id: '+CAST(@id AS NVARCHAR(36));              
        END
    ELSE IF EXISTS(SELECT * FROM INSERTED)
        BEGIN
            SELECT @id=Id FROM INSERTED
            SET @sms='Se creado un nuevo usuario con id: '+CAST(@id AS NVARCHAR(36));
        END
    ELSE IF EXISTS(SELECT * FROM DELETED)
        BEGIN
            SELECT @id=Id FROM DELETED
            SET @sms='Se eliminada al usuario con id: '+CAST(@id AS NVARCHAR(36));
        END
    
    INSERT INTO practica1.HistoryLog(Date,Description) VALUES(GETDATE(),@sms);
END;
GO

CREATE TRIGGER Trigger2 
ON practica1.UsuarioRole
AFTER INSERT,UPDATE,DELETE
AS
BEGIN
    SET NOCOUNT ON
    DECLARE @sms VARCHAR(MAX), @id uniqueidentifier;
    IF EXISTS(SELECT * FROM INSERTED) AND EXISTS(SELECT * FROM DELETED)
        BEGIN
            SELECT @id=UserId FROM INSERTED
            SET @sms='Se ha modificado el rol del usuario con id: '+CAST(@id AS NVARCHAR(36));              
        END
    ELSE IF EXISTS(SELECT * FROM INSERTED)
        BEGIN
            SELECT  @id=UserId FROM INSERTED
            SET @sms='Se creado un nuevo rol al usuario con id: '+CAST(@id AS NVARCHAR(36));
        END
    ELSE IF EXISTS(SELECT * FROM DELETED)
        BEGIN
            SELECT  @id=UserId FROM DELETED
            SET @sms='Se eliminada un rol al usuario con id: '+CAST(@id AS NVARCHAR(36));
        END
    
    INSERT INTO practica1.HistoryLog(Date,Description) VALUES(GETDATE(),@sms);
END;
GO

CREATE TRIGGER Trigger3 
ON practica1.ProfileStudent
AFTER INSERT,UPDATE,DELETE
AS
BEGIN
    SET NOCOUNT ON
    DECLARE @sms VARCHAR(MAX), @id uniqueidentifier;
    IF EXISTS(SELECT * FROM INSERTED) AND EXISTS(SELECT * FROM DELETED)
        BEGIN
            SELECT @id=UserId FROM INSERTED
            SET @sms='Se ha modificado el perfil usuario con id: '+CAST(@id AS NVARCHAR(36));              
        END
    ELSE IF EXISTS(SELECT * FROM INSERTED)
        BEGIN
            SELECT  @id=UserId FROM INSERTED
            SET @sms='Se creado un nuevo perfil al usuario con id: '+CAST(@id AS NVARCHAR(36));
        END
    ELSE IF EXISTS(SELECT * FROM DELETED)
        BEGIN
            SELECT  @id=UserId FROM DELETED
            SET @sms='Se eliminada el perfil del usuario con id: '+CAST(@id AS NVARCHAR(36));
        END
    
    INSERT INTO practica1.HistoryLog(Date,Description) VALUES(GETDATE(),@sms);
END;
GO







-- Usuarios insert,update, delete 
CREATE TRIGGER TR_USUARIO_INSERT
ON practica1.Usuarios for INSERT
AS BEGIN
    SET NOCOUNT ON
    DECLARE @sms VARCHAR(MAX), @id uniqueidentifier;
    SELECT @id=Id FROM INSERTED
    SET @sms='Se creado un nuevo usuario con id: '+CAST(@id AS NVARCHAR(36));
    INSERT INTO dbo.practica1.HistoryLog(Date,Description) 
    VALUES(GETDATE(),@sms)
END;
GO

CREATE TRIGGER TR_USUARIO_UPDATE
ON practica1.Usuarios for UPDATE
AS BEGIN
    SET NOCOUNT ON
    DECLARE @sms VARCHAR(MAX), @id uniqueidentifier;
    SELECT @id=Id FROM INSERTED
    SET @sms='Se ha modificado el usuario con id: '+CAST(@id AS NVARCHAR(36));
    INSERT INTO dbo.practica1.HistoryLog(Date,Description) 
    VALUES(GETDATE(),@sms)
END;
GO

CREATE TRIGGER TR_USUARIO_DELETE
ON practica1.Usuarios for DELETE
AS BEGIN
    SET NOCOUNT ON
    DECLARE @sms VARCHAR(MAX), @id uniqueidentifier;
    SELECT @id=Id FROM DELETED
    SET @sms='Se ha eliminado el usuario con id: '+CAST(@id AS NVARCHAR(36));
    INSERT INTO dbo.practica1.HistoryLog(Date,Description) 
    VALUES(GETDATE(),@sms)
END;
GO

-- Perfil de estudiante insert,update, delete 
CREATE TRIGGER TR_PROFILESTUDENT_INSERT
ON practica1.ProfileStudent for INSERT
AS BEGIN
    SET NOCOUNT ON
    DECLARE @sms VARCHAR(MAX), @id uniqueidentifier;
    SELECT @id=UserId FROM INSERTED
    SET @sms='Se creado un nuevo perfil de estudiante del usuario con id: '+CAST(@id AS NVARCHAR(36));
    INSERT INTO dbo.practica1.HistoryLog(Date,Description) 
    VALUES(GETDATE(),@sms)
END;
GO

CREATE TRIGGER TR_PROFILESTUDENT_UPDATE
ON practica1.ProfileStudent for UPDATE
AS BEGIN
    SET NOCOUNT ON
    DECLARE @sms VARCHAR(MAX), @id uniqueidentifier;
    SELECT @id=UserId FROM INSERTED
    SET @sms='Se ha modificado el perfil de estudiante del usuario con id: '+CAST(@id AS NVARCHAR(36));
    INSERT INTO dbo.practica1.HistoryLog(Date,Description) 
    VALUES(GETDATE(),@sms)
END;
GO

CREATE TRIGGER TR_PROFILESTUDENT_DELETE
ON practica1.ProfileStudent for DELETE
AS BEGIN
    SET NOCOUNT ON
    DECLARE @sms VARCHAR(MAX), @id uniqueidentifier;
    SELECT @id=UserId FROM DELETED
    SET @sms='Se ha eliminado el perfil de estudiante del usuario con id: '+CAST(@id AS NVARCHAR(36));
    INSERT INTO dbo.practica1.HistoryLog(Date,Description) 
    VALUES(GETDATE(),@sms)
END;
GO

-- TFA insert,update, delete 
CREATE TRIGGER TR_TFA_INSERT
ON practica1.TFA for INSERT
AS BEGIN
    SET NOCOUNT ON
    DECLARE @sms VARCHAR(MAX), @id uniqueidentifier;
    SELECT @id=UserId FROM INSERTED
    SET @sms='Se creado un nueva autenticación de dos factores del usuario con id: '+CAST(@id AS NVARCHAR(36));
    INSERT INTO dbo.practica1.HistoryLog(Date,Description) 
    VALUES(GETDATE(),@sms)
END;
GO

CREATE TRIGGER TR_TFA_UPDATE
ON practica1.TFA for UPDATE
AS BEGIN
    SET NOCOUNT ON
    DECLARE @sms VARCHAR(MAX), @id uniqueidentifier;
    SELECT @id=UserId FROM INSERTED
    SET @sms='Se ha modificado la autenticación de dos factores del usuario con id: '+CAST(@id AS NVARCHAR(36));
    INSERT INTO dbo.practica1.HistoryLog(Date,Description) 
    VALUES(GETDATE(),@sms)
END;
GO

CREATE TRIGGER TR_TFA_DELETE
ON practica1.TFA for DELETE
AS BEGIN
    SET NOCOUNT ON
    DECLARE @sms VARCHAR(MAX), @id uniqueidentifier;
    SELECT @id=UserId FROM DELETED
    SET @sms='Se ha eliminado la autenticación de dos factores del usuario con id: '+CAST(@id AS NVARCHAR(36));
    INSERT INTO dbo.practica1.HistoryLog(Date,Description) 
    VALUES(GETDATE(),@sms)
END;
GO

-- Roles de Usuario insert,update, delete 

CREATE TRIGGER TR_ROLEUSER_INSERT
ON practica1.UsuarioRole for INSERT
AS BEGIN
    SET NOCOUNT ON
    DECLARE @sms VARCHAR(MAX), @id uniqueidentifier;
    SELECT @id=UserId FROM INSERTED
    SET @sms='Se creado un nuevo rol del usuario con id: '+CAST(@id AS NVARCHAR(36));
    INSERT INTO dbo.practica1.HistoryLog(Date,Description) 
    VALUES(GETDATE(),@sms)
END;
GO

CREATE TRIGGER TR_ROLEUSER_UPDATE
ON practica1.UsuarioRole for UPDATE
AS BEGIN
    SET NOCOUNT ON
    DECLARE @sms VARCHAR(MAX), @id uniqueidentifier;
    SELECT @id=UserId FROM INSERTED
    SET @sms='Se ha modificado el rol del usuario con id: '+CAST(@id AS AS NVARCHAR(36));
    INSERT INTO dbo.practica1.HistoryLog(Date,Description) 
    VALUES(GETDATE(),@sms)
END;
GO

CREATE TRIGGER TR_ROLEUSER_DELETE
ON practica1.UsuarioRole for DELETE
AS BEGIN
    SET NOCOUNT ON
    DECLARE @sms VARCHAR(MAX), @id uniqueidentifier;
    SELECT @id=UserId FROM DELETED
    SET @sms='Se ha eliminado el rol del usuario con id: '+CAST(@id AS NVARCHAR(36));
    INSERT INTO dbo.practica1.HistoryLog(Date,Description) 
    VALUES(GETDATE(),@sms)
END;
GO

-- Notificacion insert,update, delete 

CREATE TRIGGER TR_NOTIFICATION_INSERT
ON practica1.Notification for INSERT
AS BEGIN
    SET NOCOUNT ON
    DECLARE @sms VARCHAR(MAX), @id uniqueidentifier,@message VARCHAR(MAX);
    SELECT @id=UserId, @message=Message FROM INSERTED
    SET @sms='Se notificado usuario con id: '+CAST(@id AS NVARCHAR(36))+' Mensaje:'+@message;
    INSERT INTO dbo.practica1.HistoryLog(Date,Description) 
    VALUES(GETDATE(),@sms)
END;
GO

--  ROL insert,update, delete 
CREATE TRIGGER TR_ROL_INSERT
ON practica1.Roles for INSERT
AS BEGIN
    SET NOCOUNT ON
    DECLARE @sms VARCHAR(MAX), @id uniqueidentifier;
    SELECT @id=Id FROM INSERTED
    SET @sms='Se creado un nuevo rol id: '+CAST(@id AS NVARCHAR(36));
    INSERT INTO practica1.HistoryLog(Date,Description) 
    VALUES(GETDATE(),@sms)
END;
GO

CREATE TRIGGER TR_ROL_UPDATE
ON practica1.Roles for UPDATE
AS BEGIN
    SET NOCOUNT ON
    DECLARE @sms VARCHAR(MAX), @id uniqueidentifier;
    SELECT @id=Id FROM INSERTED
    SET @sms='Se ha modificado el rol con id: '+CAST(@id AS NVARCHAR(36));
    INSERT INTO practica1.HistoryLog(Date,Description) 
    VALUES(GETDATE(),@sms)
END;
GO

CREATE TRIGGER TR_ROL_DELETE
ON practica1.Roles for DELETE
AS BEGIN
    SET NOCOUNT ON
    DECLARE @sms VARCHAR(MAX), @id uniqueidentifier;
    SELECT @id=Id FROM DELETED
    SET @sms='Se ha eliminado el rol con id: '+CAST(@id AS NVARCHAR(36));
    INSERT INTO practica1.HistoryLog(Date,Description) 
    VALUES(GETDATE(),@sms)
END;
GO