USE CBZHotels;

DROP PROCEDURE IF EXISTS sp_opret_booking;

CREATE PROCEDURE sp_opret_booking(
    IN p_gæste_id INT,
    IN p_hotel_id INT,
    IN p_værelse_id INT,
    IN p_check_ind_dato DATE,
    IN p_check_ud_dato DATE,
    IN p_online_booking BOOLEAN,
    IN p_fdm_medlem BOOLEAN
)
BEGIN
    DECLARE v_værelse_pris DECIMAL(8,2);
    DECLARE v_antal_dage INT;
    DECLARE v_total_pris DECIMAL(10,2);
    DECLARE v_er_ledig BOOLEAN;

    IF p_check_ind_dato >= p_check_ud_dato THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Check-ud dato skal være efter check-ind dato';
    END IF;

    SELECT pris INTO v_værelse_pris
    FROM værelser
    WHERE hotel_id = p_hotel_id AND værelse_id = p_værelse_id;

    IF v_værelse_pris IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Værelset findes ikke';
    END IF;

    SELECT COUNT(*) = 0 INTO v_er_ledig
    FROM bookinger
    WHERE hotel_id = p_hotel_id 
    AND værelse_id = p_værelse_id
    AND booking_status = 'Bekræftet'
    AND (
        (check_ind_dato BETWEEN p_check_ind_dato AND p_check_ud_dato)
        OR (check_ud_dato BETWEEN p_check_ind_dato AND p_check_ud_dato)
        OR (check_ind_dato <= p_check_ind_dato AND check_ud_dato >= p_check_ud_dato)
    );

    IF NOT v_er_ledig THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Værelset er ikke ledigt i den valgte periode';
    END IF;

    SET v_antal_dage = DATEDIFF(p_check_ud_dato, p_check_ind_dato);
    SET v_total_pris = v_værelse_pris * v_antal_dage;

    IF p_fdm_medlem THEN
        SET v_total_pris = v_total_pris * 0.90;
    END IF;

    INSERT INTO bookinger (
        gæste_id, hotel_id, værelse_id, check_ind_dato, check_ud_dato,
        online_booking, fdm_medlem, total_pris, booking_status
    ) VALUES (
        p_gæste_id, p_hotel_id, p_værelse_id, p_check_ind_dato, p_check_ud_dato,
        p_online_booking, p_fdm_medlem, v_total_pris, 'Bekræftet'
    );

    SELECT LAST_INSERT_ID() AS booking_id, v_total_pris AS total_pris;
END;

DROP PROCEDURE IF EXISTS sp_find_ledige_værelser;

CREATE PROCEDURE sp_find_ledige_værelser(
    IN p_hotel_id INT,
    IN p_check_ind_dato DATE,
    IN p_check_ud_dato DATE
)
BEGIN
    SELECT 
        v.værelse_id,
        v.værelse_type,
        v.pris,
        h.hotel_navn
    FROM værelser v
    JOIN hoteller h ON v.hotel_id = h.hotel_id
    WHERE v.hotel_id = p_hotel_id
    AND (v.værelse_id, v.hotel_id) NOT IN (
        SELECT værelse_id, hotel_id
        FROM bookinger
        WHERE booking_status = 'Bekræftet'
        AND (
            (check_ind_dato BETWEEN p_check_ind_dato AND p_check_ud_dato)
            OR (check_ud_dato BETWEEN p_check_ind_dato AND p_check_ud_dato)
            OR (check_ind_dato <= p_check_ind_dato AND check_ud_dato >= p_check_ud_dato)
        )
    );
END;
CREATE PROCEDURE sp_rediger_booking(
    IN p_booking_id INT,
    IN p_gæste_id INT,
    IN p_hotel_id INT,
    IN p_værelse_id INT,
    IN p_check_ind_dato DATE,
    IN p_check_ud_dato DATE,
    IN p_online_booking BOOLEAN,
    IN p_fdm_medlem BOOLEAN
)
BEGIN
    UPDATE bookinger
    SET 
        gæste_id = p_gæste_id,
        hotel_id = p_hotel_id,
        værelse_id = p_værelse_id,
        check_ind_dato = p_check_ind_dato,
        check_ud_dato = p_check_ud_dato,
        online_booking = p_online_booking,
        fdm_medlem = p_fdm_medlem
    WHERE booking_id = p_booking_id;
END;
CREATE VIEW v_bookinger AS
SELECT 
    b.*,
    CONCAT(g.fornavn, ' ', g.efternavn) as gæst_navn,
    h.hotel_navn
FROM 
    bookinger b
    JOIN gæster g ON b.gæste_id = g.gæste_id
    JOIN hoteller h ON b.hotel_id = h.hotel_id;