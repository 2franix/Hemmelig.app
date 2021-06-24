import { h } from 'preact';
import style from './style.css';

import { Copy, Account, Share } from '.';

const getIcon = (type) => {
    switch (type) {
        case 'copy':
            return Copy;
        case 'account':
            return Account;
        case 'share':
            return Share;
        default:
            return () => {};
    }
};

const IconButton = ({ icon = '', ...rest }) => {
    const Icon = getIcon(icon);

    return (
        <button class={style.button} {...rest}>
            <Icon />
        </button>
    );
};

export default IconButton;
