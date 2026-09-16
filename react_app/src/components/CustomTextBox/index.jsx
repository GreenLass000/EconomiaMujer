import React from 'react';
import PropTypes from 'prop-types';

const CustomTextBox = ({ text }) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            // justifyContent: 'center',
            width: '100%',
            height: '50px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            border: '1px solid lightgray',
            // borderRadius: '10px',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#424242',
            textAlign: 'center',
            // marginBottom: '.5rem',
        }}>
            &nbsp;&nbsp;{text}
        </div>
    );
};

CustomTextBox.propTypes = {
    text: PropTypes.string.isRequired,
};

export default CustomTextBox;
