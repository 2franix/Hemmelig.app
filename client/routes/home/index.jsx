import {
    IconAlertCircle,
    IconClock,
    IconEye,
    IconFileUpload,
    IconFlame,
    IconHeading,
    IconKey,
    IconLink,
    IconLock,
    IconLockAccess,
    IconLockOpen,
    IconNetwork,
    IconShare,
    IconShieldLock,
    IconTrash,
    IconX,
} from '@tabler/icons';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { burnSecret } from '../../api/secret';
import CopyButton from '../../components/CopyButton';
import QRLink from '../../components/qrlink';
import Quill from '../../components/quill';
import { Switch } from '../../components/switch';
import config from '../../config';
import { trackPageView } from '../../services/analytics';
import useAuthStore from '../../stores/authStore';
import useSecretStore from '../../stores/secretStore';
import useSettingsStore from '../../stores/settingsStore';

const Home = () => {
    const { t } = useTranslation();
    const { isLoggedIn } = useAuthStore();
    const { settings } = useSettingsStore();
    const [isDragging, setIsDragging] = useState(false);
    const location = useLocation();

    const {
        formData,
        enablePassword,
        isPublic,
        creatingSecret,
        errors,
        secretId,
        encryptionKey,
        reset,
        removeFile,
        handleSubmit,
        onEnablePassword,
        setField,
    } = useSecretStore();

    useEffect(() => {
        if (config.get('settings.analytics.enabled')) {
            trackPageView(location.pathname);
        }
    }, [location.pathname]);

    const onSubmit = (event) => {
        handleSubmit(event, t);
    };

    const ttlValues = [
        { value: 604800, label: t('home.7_days') },
        { value: 259200, label: t('home.3_days') },
        { value: 86400, label: t('home.1_day') },
        { value: 43200, label: t('home.12_hours') },
        { value: 14400, label: t('home.4_hours') },
        { value: 3600, label: t('home.1_hour') },
        { value: 1800, label: t('home.30_minutes') },
        { value: 300, label: t('home.5_minutes') },
    ];

    if (isLoggedIn) {
        ttlValues.unshift(
            { value: 2419200, label: t('home.28_days') },
            { value: 1209600, label: t('home.14_days') }
        );
    }

    const onSetPublic = () => {
        setField('isPublic', !isPublic);
    };

    const handleFocus = (event) => event.target.select();

    const getSecretURL = (withEncryptionKey = true) => {
        if (!withEncryptionKey) return `${window.location.origin}/secret/${secretId}`;
        return `${window.location.origin}/secret/${secretId}#encryption_key=${encryptionKey}`;
    };

    const onShare = (event) => {
        event.preventDefault();
        if (navigator.share) {
            navigator
                .share({
                    title: 'hemmelig.app',
                    text: t('home.get_your_secret'),
                    url: getSecretURL(),
                })
                .then(() => console.log(t('home.successful_share')))
                .catch(console.error);
        }
    };

    const onBurn = async (event) => {
        if (!secretId) return;
        event.preventDefault();
        await burnSecret(secretId);
        reset();
    };

    const inputReadOnly = !!secretId;
    const disableFileUpload =
        isPublic || (config.get('settings.upload_restriction') && !isLoggedIn);

    const dismissError = () => {
        setField('errors.banner.title', '');
        setField('errors.banner.message', '');
        setField('errors.banner.dismissible', true);
    };

    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
        (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                setField('formData.files', [...formData.files, ...files]);
            }
        },
        [formData.files, setField]
    );

    const isTextEmpty = () => formData.text.trim() === '';

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <form onSubmit={onSubmit} className="space-y-8">
                <div className="text-center space-y-4 mb-12">
                    <h1 className="text-3xl font-bold text-white">{t('home.title')}</h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        {t('home.description')}
                    </p>
                </div>

                {errors.banner.message && (
                    <ErrorBanner
                        title={errors.banner.title}
                        message={errors.banner.message}
                        onDismiss={errors.banner.dismissible ? dismissError : undefined}
                    />
                )}

                <FormSection>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Quill
                                name="text"
                                value={formData.text}
                                onChange={(value) => setField('formData.text', value)}
                                readOnly={inputReadOnly}
                                className={`
                                    bg-black/20 border-white/[0.08]
                                    hover:border-white/[0.12] focus:border-primary
                                    transition-colors duration-200
                                    ${errors.fields.text ? 'border-red-500/50' : ''}
                                `}
                            />
                            {errors.fields.text && <FieldError message={errors.fields.text} />}
                        </div>

                        <div className="relative">
                            <div className="absolute left-3 top-[13px] text-gray-400 pointer-events-none">
                                <IconHeading size={18} />
                            </div>
                            <input
                                type="text"
                                name="title"
                                placeholder={t('home.content_title')}
                                value={formData.title}
                                onChange={(e) => setField('formData.title', e.target.value)}
                                readOnly={inputReadOnly}
                                className="w-full pl-10 pr-3 py-2.5 bg-gray-800 border border-gray-700 rounded-md
                                         focus:ring-2 focus:ring-hemmelig focus:border-transparent
                                         text-base text-gray-100 placeholder-gray-500"
                            />
                            <p className="mt-2 text-sm text-gray-400">
                                {t('home.title_description')}
                            </p>
                        </div>
                    </div>
                </FormSection>

                <FormSection
                    title={t('home.security')}
                    subtitle={t('home.security_description')}
                    collapsible
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={onSetPublic}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-3
                                        bg-black/20 rounded-lg border border-white/[0.08]
                                        hover:border-white/[0.12] transition-colors duration-200
                                        ${!isPublic ? 'text-primary border-primary/50' : 'text-gray-300'}
                                    `}
                                >
                                    {isPublic ? <IconLockOpen size={18} /> : <IconLock size={18} />}
                                    <span className="text-sm font-medium">
                                        {t(isPublic ? 'home.public' : 'home.private')}
                                    </span>
                                </button>
                                <div className="px-4">
                                    <p className="text-xs text-gray-400">
                                        {isPublic
                                            ? t(
                                                  'home.public_description',
                                                  'Public secrets are not encrypted and can be viewed by anyone with the link'
                                              )
                                            : t(
                                                  'home.private_description',
                                                  'Private secrets are encrypted and can only be viewed with the decryption key'
                                              )}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onEnablePassword}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3
                                    bg-black/20 rounded-lg border border-white/[0.08]
                                    hover:border-white/[0.12] transition-colors duration-200
                                    ${enablePassword ? 'text-primary border-primary/50' : 'text-gray-300'}
                                `}
                            >
                                <IconShieldLock size={18} />
                                <span className="text-sm font-medium">{t('home.password')}</span>
                            </button>

                            {enablePassword && (
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <IconKey className="text-gray-400" size={14} />
                                    </div>
                                    <input
                                        type="text"
                                        name="password"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setField('formData.password', e.target.value)
                                        }
                                        readOnly={inputReadOnly}
                                        className="w-full pl-10 pr-10 bg-gray-800 border border-gray-700
                                                 rounded-lg text-gray-100 placeholder-gray-500
                                                 focus:border-primary focus:ring-1 focus:ring-primary"
                                        placeholder={t('home.password')}
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                                        <CopyButton textToCopy={formData.password} />
                                    </div>
                                </div>
                            )}

                            {!settings.hide_allowed_ip_input && (
                                <div className="relative">
                                    <div className="absolute left-3 top-[13px] text-gray-400 pointer-events-none">
                                        <IconNetwork size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="allowedIp"
                                        placeholder="0.0.0.0/0"
                                        value={formData.allowedIp}
                                        onChange={(e) =>
                                            setField('formData.allowedIp', e.target.value)
                                        }
                                        readOnly={inputReadOnly}
                                        className="w-full pl-10 pr-3 py-2.5 bg-gray-800 border border-gray-700 rounded-md
                                                 focus:ring-2 focus:ring-hemmelig focus:border-transparent
                                                 text-base text-gray-100 placeholder-gray-500"
                                    />
                                    <p className="mt-2 text-xs text-gray-400">
                                        {t('home.restrict_from_ip')}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <div className="absolute left-3 top-[13px] text-gray-400 pointer-events-none">
                                    <IconClock size={18} />
                                </div>
                                <select
                                    value={formData.ttl}
                                    onChange={(e) => setField('formData.ttl', e.target.value)}
                                    className="w-full pl-10 pr-3 py-2.5 bg-gray-800 border border-gray-700 rounded-md
                                             text-gray-100 focus:border-primary focus:ring-1 focus:ring-primary
                                             appearance-none"
                                >
                                    {ttlValues.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-2 text-xs text-gray-400">
                                    {t('home.ttl_description')}
                                </p>
                            </div>

                            {!formData.preventBurn && (
                                <div className="relative">
                                    <div className="absolute left-3 top-[13px] text-gray-400 pointer-events-none">
                                        <IconEye size={18} />
                                    </div>
                                    <input
                                        type="number"
                                        name="maxViews"
                                        value={formData.maxViews}
                                        onChange={(e) =>
                                            setField('formData.maxViews', e.target.value)
                                        }
                                        min="1"
                                        max="999"
                                        className="w-full pl-10 pr-3 py-2.5 bg-gray-800 border border-gray-700 rounded-md
                                                 text-gray-100 focus:border-primary focus:ring-1 focus:ring-primary"
                                    />
                                    <p className="mt-2 text-xs text-gray-400">
                                        {t('home.max_views_description')}
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/[0.08]">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-orange-500/10 rounded-lg">
                                        <IconFlame className="text-orange-400" size={18} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white/90">
                                            {t('home.burn_after_time')}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {t('home.burn_aftertime')}
                                        </div>
                                    </div>
                                </div>
                                <Switch
                                    checked={formData.preventBurn}
                                    onChange={(checked) =>
                                        setField('formData.preventBurn', checked)
                                    }
                                >
                                    {t('home.burn_after_time')}
                                </Switch>
                            </div>
                        </div>
                    </div>
                </FormSection>

                {!settings.disable_file_upload && (
                    <>
                        {!disableFileUpload && (
                            <FormSection
                                title={t('home.file_upload')}
                                error={errors.sections.files}
                            >
                                <div className="space-y-4">
                                    <div
                                        onDragEnter={handleDragEnter}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={`
                                            relative flex flex-col items-center justify-center p-8
                                            border-2 border-dashed rounded-lg transition-all duration-200
                                            ${
                                                isDragging
                                                    ? 'border-primary bg-primary/10 scale-[1.01] shadow-lg shadow-primary/5'
                                                    : 'border-white/[0.08] hover:border-white/[0.15] bg-black/20 hover:bg-black/30'
                                            }
                                        `}
                                    >
                                        <div
                                            className={`
                                            p-4 rounded-full mb-3 transition-all duration-200
                                            ${isDragging ? 'bg-primary/10' : 'bg-white/[0.02]'}
                                        `}
                                        >
                                            <IconFileUpload
                                                size={24}
                                                className={`transition-colors duration-200 ${isDragging ? 'text-primary' : 'text-gray-400'}`}
                                            />
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <input
                                                type="file"
                                                id="fileUpload"
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files || []);
                                                    setField('formData.files', [
                                                        ...formData.files,
                                                        ...files,
                                                    ]);
                                                }}
                                                multiple
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="fileUpload"
                                                className="flex items-center gap-2 px-4 py-2 
                                                    bg-gray-800/80 text-gray-300 font-medium
                                                    hover:bg-gray-700 rounded-md cursor-pointer 
                                                    transition-all duration-200 hover:scale-[1.02]
                                                    active:scale-[0.98]"
                                            >
                                                <IconFileUpload size={16} />
                                                <span>{t('home.upload_files')}</span>
                                            </label>
                                            <p className="text-sm text-gray-400">
                                                {t('home.drag_and_drop')}
                                            </p>
                                        </div>
                                    </div>

                                    {formData.files.length > 0 && (
                                        <div className="space-y-2">
                                            {formData.files.map((file, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between 
                                                        bg-gradient-to-r from-gray-800/90 to-gray-800/70
                                                        backdrop-blur-sm rounded-md px-4 py-3
                                                        border border-white/[0.05] hover:border-white/[0.08]
                                                        transition-all duration-200"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="p-2 bg-white/[0.05] rounded-lg">
                                                            <IconFileUpload
                                                                size={14}
                                                                className="text-gray-400"
                                                            />
                                                        </div>
                                                        <span className="text-sm text-gray-300 truncate">
                                                            {file.name}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="p-2 text-red-400 hover:text-red-300 
                                                            hover:bg-red-500/10 rounded-lg
                                                            transition-all duration-200"
                                                        title={t('home.remove_file')}
                                                    >
                                                        <IconTrash size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </FormSection>
                        )}
                        {config.get('settings.upload_restriction') && !isLoggedIn && (
                            <FormSection title={t('home.file_upload')} collapsible={!isLoggedIn}>
                                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/[0.08]">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <IconFileUpload className="text-primary" size={18} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white/90">
                                                {t('home.login_to_upload')}
                                            </div>
                                        </div>
                                    </div>
                                    <Link
                                        to="/signin"
                                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors"
                                    >
                                        {t('home.sign_in')}
                                    </Link>
                                </div>
                            </FormSection>
                        )}
                    </>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                    {secretId ? (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                reset();
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 
                                     bg-hemmelig text-white rounded-md hover:bg-hemmelig-700 
                                     transition-colors"
                        >
                            <IconLockAccess size={14} />
                            {t('home.create_new')}
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={
                                creatingSecret ||
                                (settings.read_only && !isLoggedIn) ||
                                isTextEmpty()
                            }
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 
                                     bg-hemmelig text-white rounded-md hover:bg-hemmelig-700 
                                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                                     group relative"
                            title={isTextEmpty() ? t('home.text_required') : ''}
                        >
                            {creatingSecret ? (
                                <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2" />
                            ) : (
                                <>
                                    <IconLockAccess size={14} />
                                    {t('home.create')}
                                </>
                            )}
                            {isTextEmpty() && (
                                <span
                                    className="absolute -top-10 left-1/2 transform -translate-x-1/2 
                                       px-2 py-1 bg-gray-800 text-xs text-gray-300 rounded
                                       opacity-0 group-hover:opacity-100 transition-opacity
                                       whitespace-nowrap pointer-events-none"
                                >
                                    {t('home.text_required')}
                                </span>
                            )}
                        </button>
                    )}

                    {secretId && (
                        <button
                            type="button"
                            onClick={onShare}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 
                                     bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 
                                     transition-colors"
                        >
                            <IconShare size={14} />
                            {t('home.share')}
                        </button>
                    )}
                </div>

                {secretId && (
                    <>
                        <FormSection
                            title={t('home.complete_url')}
                            subtitle={t('home.complete_url_description')}
                        >
                            <div className="space-y-2">
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                        <IconLink size={14} />
                                    </span>
                                    <input
                                        type="text"
                                        value={getSecretURL(true)}
                                        readOnly
                                        onClick={handleFocus}
                                        className="w-full pl-10 pr-20 py-2 bg-gray-800 border border-gray-700 
                                                 rounded-md text-gray-100"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                                        <CopyButton textToCopy={getSecretURL(true)} />
                                    </div>
                                </div>
                            </div>
                        </FormSection>

                        <FormSection
                            title={t('home.secret_url')}
                            subtitle={t('home.secret_description')}
                        >
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">
                                        {t('home.secret_url')}
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                            <IconLink size={14} />
                                        </span>
                                        <input
                                            type="text"
                                            value={getSecretURL(false)}
                                            readOnly
                                            onClick={handleFocus}
                                            className="w-full pl-10 pr-20 py-2 bg-gray-800 border border-gray-700 
                                                     rounded-md text-gray-100"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                                            <CopyButton textToCopy={getSecretURL(false)} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">
                                        {t('home.decryption_key')}
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                            <IconKey size={14} />
                                        </span>
                                        <input
                                            type="text"
                                            value={encryptionKey}
                                            readOnly
                                            onClick={handleFocus}
                                            className="w-full pl-10 pr-20 py-2 bg-gray-800 border border-gray-700 
                                                     rounded-md text-gray-100"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                                            <CopyButton textToCopy={encryptionKey} />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <QRLink value={getSecretURL()} />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={onShare}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 
                                                 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 
                                                 transition-colors"
                                    >
                                        <IconShare size={14} />
                                        {t('home.share')}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={onBurn}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 
                                                 bg-red-500/20 text-red-500 rounded-md hover:bg-red-500/30 
                                                 transition-colors"
                                    >
                                        <IconTrash size={14} />
                                        {t('home.burn')}
                                    </button>
                                </div>
                            </div>
                        </FormSection>
                    </>
                )}
            </form>

            <p className="text-gray-400 text-xs text-center pt-6">
                Hemmelig, [he`m:(ə)li], {t('home.norwegian_meaning')}
            </p>
        </div>
    );
};

const ErrorBanner = ({ message, onDismiss }) => {
    const { t } = useTranslation();
    return (
        <div
            className="relative bg-gradient-to-br from-red-950/40 to-red-900/30 
                        backdrop-blur-sm rounded-xl border border-red-500/20 
                        shadow-lg shadow-red-500/5"
        >
            <div className="relative px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0 p-2 bg-red-500/10 rounded-lg">
                            <IconAlertCircle className="text-red-400" size={20} />
                        </div>
                        <p className="text-sm font-medium text-red-200 truncate">{message}</p>
                    </div>
                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            className="flex-shrink-0 p-2 hover:bg-red-500/10 
                                     rounded-lg transition-colors duration-200"
                            aria-label={t('home.dismiss')}
                        >
                            <IconX className="text-red-400" size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const FieldError = ({ message }) => (
    <div className="flex items-center gap-2 mt-2">
        <div className="p-1 bg-red-500/10 rounded">
            <IconAlertCircle className="text-red-400" size={12} />
        </div>
        <span className="text-xs font-medium text-red-400">{message}</span>
    </div>
);

const FormSection = ({ title, subtitle, children, error, collapsible }) => {
    const [isCollapsed, setIsCollapsed] = useState(collapsible);

    return (
        <div className="relative space-y-4">
            {title && (
                <div
                    className={`space-y-1 ${collapsible ? 'cursor-pointer' : ''}`}
                    onClick={() => collapsible && setIsCollapsed(!isCollapsed)}
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white/90">{title}</h2>
                        {collapsible && (
                            <button
                                type="button"
                                className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                                aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                            >
                                <svg
                                    className={`w-5 h-5 transform transition-transform duration-200 ${
                                        isCollapsed ? '-rotate-90' : ''
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>
                    {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
                </div>
            )}
            <div
                className={`
                    relative overflow-hidden transition-all duration-200 ease-in-out
                    ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'}
                `}
            >
                <div
                    className={`
                        relative overflow-hidden
                        md:bg-gradient-to-br md:from-gray-800/50 md:to-gray-900/50
                        md:border ${error ? 'border-red-500/20' : 'border-white/[0.08]'}
                    `}
                >
                    <div className="relative md:p-6">{children}</div>
                </div>
            </div>
            {error && <FieldError message={error} />}
        </div>
    );
};

export default Home;
