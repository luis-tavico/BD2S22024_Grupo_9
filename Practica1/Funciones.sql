USE BD2;
GO

--- ***********************
--  *     Funcion F1      *
--  ***********************

CREATE FUNCTION F1 (@CodCourse INT)
RETURNS TABLE
AS
RETURN
(
    SELECT U.Firstname, U.Lastname, U.Email
    FROM practica1.Usuarios U
    INNER JOIN practica1.CourseAssignment CA ON U.Id = CA.StudentId
    WHERE CA.CourseCodCourse = @CodCourse
);
GO

--- ***********************
--  *     Funcion F2      *
--  ***********************

CREATE FUNCTION F2 (@TutorId uniqueidentifier)
RETURNS TABLE
AS
RETURN
(
    SELECT C.Name
	FROM practica1.Course C
    INNER JOIN practica1.CourseTutor CT ON C.CodCourse = CT.CourseCodCourse
    WHERE CT.TutorId = @TutorId
);
GO

--- ***********************
--  *     Funcion F3      *
--  ***********************

CREATE FUNCTION F3 (@UserId uniqueidentifier)
RETURNS TABLE
AS
RETURN
(
	SELECT * FROM practica1.Notification WHERE UserId=@UserId
);
GO

--- ***********************
--  *     Funcion F4      *
--  ***********************

CREATE FUNCTION F4 ()
RETURNS TABLE
AS
RETURN
(
	SELECT * FROM practica1.HistoryLog
);
GO

--- ***********************
--  *     Funcion F5      *
--  ***********************

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

--SELECT * FROM F1(970);
--SELECT * FROM F2('193D9295-07BD-48BF-995B-C92A3EACF92F');
--SELECT * FROM F3('193D9295-07BD-48BF-995B-C92A3EACF92F');
--SELECT * FROM F4();
--SELECT * FROM F5('193D9295-07BD-48BF-995B-C92A3EACF92F');