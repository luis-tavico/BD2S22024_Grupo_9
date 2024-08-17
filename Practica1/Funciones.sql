USE BD2;

GO
CREATE FUNCTION F3 (
	@UserId uniqueidentifier
)
RETURNS TABLE
AS
	
	RETURN (SELECT * FROM practica1.Notification WHERE UserId=@UserId)

;




GO
CREATE FUNCTION F4 ()
RETURNS TABLE
AS

	 RETURN (SELECT * FROM practica1.HistoryLog)

;
