USE BD2;
GO

CREATE FUNCTION F3 (@UserId uniqueidentifier)
RETURNS TABLE
AS
RETURN
(
	SELECT * FROM practica1.Notification WHERE UserId=@UserId
);
GO

CREATE FUNCTION F4 ()
RETURNS TABLE
AS
RETURN
(
	SELECT * FROM practica1.HistoryLog
);
GO

CREATE FUNCTION F5 (@UserId uniqueidentifier)
RETURNS TABLE
AS
RETURN
(
    SELECT U.Firstname, U.Lastname, U.Email, U.DateOfBirth, PS.Credits, R.RoleName
    FROM practica1.Usuarios U
	INNER JOIN practica1.ProfileStudent PS ON U.Id = PS.UserId
    INNER JOIN practica1.UsuarioRole UR ON U.Id = UR.UserId
    INNER JOIN practica1.Roles R ON UR.RoleId = R.Id
    WHERE U.Id = @UserId AND R.RoleName = 'Student'
);
GO

SELECT * FROM F3('193D9295-07BD-48BF-995B-C92A3EACF92F');
SELECT * FROM F4();
--SELECT * FROM F5('193D9295-07BD-48BF-995B-C92A3EACF92F');