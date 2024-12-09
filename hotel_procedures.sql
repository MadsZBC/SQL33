USE CBZHotels;

-- Procedure til at oprette en konference booking
CREATE PROCEDURE sp_opret_konference_booking(
    IN p_hotel_id INT,
    IN p_gæste_id INT,
    IN p_start_dato DATE,
    IN p_slut_dato DATE,
    IN p_antal_gæster INT,
    IN p_kunde_ønsker TEXT,
    IN p_forplejning VARCHAR(100),
    IN p_udstyr VARCHAR(100)
)
BEGIN
    -- Validér at det er The Pope hotel for Pave Francis
    IF p_hotel_id != 1 THEN -- The Pope hotel_id
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Konference kan kun bookes på The Pope hotel';
    END IF;

    -- Validér datoer
    IF p_start_dato >= p_slut_dato THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Slut dato skal være efter start dato';
    END IF;

    -- Indsæt konference booking
    INSERT INTO konference_bookinger (
        hotel_id,
        gæste_id,
        start_dato,
        slut_dato,
        antal_gæster,
        kunde_ønsker,
        forplejning,
        udstyr
    ) VALUES (
        p_hotel_id,
        p_gæste_id,
        p_start_dato,
        p_slut_dato,
        p_antal_gæster,
        p_kunde_ønsker,
        p_forplejning,
        p_udstyr
    );

    SELECT LAST_INSERT_ID() AS konference_id;
END;

-- Procedure til at oprette hotel personale
CREATE PROCEDURE sp_opret_personale(
    IN p_hotel_id INT,
    IN p_fornavn VARCHAR(100),
    IN p_efternavn VARCHAR(100),
    IN p_stillingsbetegnelse VARCHAR(50),
    IN p_løn DECIMAL(10,2)
)
BEGIN
    -- Validér stillingsbetegnelse
    IF p_stillingsbetegnelse NOT IN ('Rengøringsassistent', 'Leder', 'Receptionist', 'Kok') THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Ugyldig stillingsbetegnelse';
    END IF;

    -- Validér løn baseret på stilling
    CASE p_stillingsbetegnelse
        WHEN 'Rengøringsassistent' THEN
            IF p_løn < 28000 OR p_løn > 31000 THEN
                SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Ugyldig løn for rengøringsassistent';
            END IF;
        WHEN 'Leder' THEN
            IF p_løn < 45000 OR p_løn > 50000 THEN
                SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Ugyldig løn for leder';
            END IF;
        WHEN 'Receptionist' THEN
            IF p_løn < 32000 OR p_løn > 36000 THEN
                SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Ugyldig løn for receptionist';
            END IF;
        WHEN 'Kok' THEN
            IF p_løn < 35000 OR p_løn > 40000 THEN
                SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Ugyldig løn for kok';
            END IF;
    END CASE;

    -- Opret personale
    INSERT INTO hotel_personale (
        hotel_id,
        fornavn,
        efternavn,
        stillingsbetegnelse,
        ansættelsesdato,
        løn
    ) VALUES (
        p_hotel_id,
        p_fornavn,
        p_efternavn,
        p_stillingsbetegnelse,
        CURRENT_DATE,
        p_løn
    );

    SELECT LAST_INSERT_ID() AS personale_id;
END;

-- Procedure til at beregne rabat på booking
CREATE PROCEDURE sp_beregn_booking_pris(
    IN p_værelse_pris DECIMAL(10,2),
    IN p_antal_dage INT,
    IN p_online_booking BOOLEAN,
    IN p_fdm_medlem BOOLEAN,
    OUT p_total_pris DECIMAL(10,2)
)
BEGIN
    SET p_total_pris = p_værelse_pris * p_antal_dage;
    
    -- Anvend online booking rabat (10%)
    IF p_online_booking THEN
        SET p_total_pris = p_total_pris * 0.90;
    END IF;
    
    -- Anvend FDM medlemsrabat (12%)
    IF p_fdm_medlem THEN
        SET p_total_pris = p_total_pris * 0.88;
    END IF;
END;

-- Procedure til at tjekke værelses tilgængelighed
CREATE PROCEDURE sp_tjek_værelse_tilgængelighed(
    IN p_hotel_id INT,
    IN p_værelse_id INT,
    IN p_start_dato DATE,
    IN p_slut_dato DATE,
    OUT p_er_tilgængelig BOOLEAN
)
BEGIN
    SELECT COUNT(*) = 0 INTO p_er_tilgængelig
    FROM bookinger
    WHERE hotel_id = p_hotel_id 
    AND værelse_id = p_værelse_id
    AND booking_status = 'Bekræftet'
    AND (
        (check_ind_dato BETWEEN p_start_dato AND p_slut_dato)
        OR (check_ud_dato BETWEEN p_start_dato AND p_slut_dato)
        OR (check_ind_dato <= p_start_dato AND check_ud_dato >= p_slut_dato)
    );
END; 