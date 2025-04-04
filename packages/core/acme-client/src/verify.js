/**
 * ACME challenge verification
 */

import dnsSdk from "dns"
import https from 'https'
import {log} from './logger.js'
import axios from './axios.js'
import * as util from './util.js'
import {isAlpnCertificateAuthorizationValid} from './crypto/index.js'


const dns = dnsSdk.promises
/**
 * Verify ACME HTTP challenge
 *
 * https://datatracker.ietf.org/doc/html/rfc8555#section-8.3
 *
 * @param {object} authz Identifier authorization
 * @param {object} challenge Authorization challenge
 * @param {string} keyAuthorization Challenge key authorization
 * @param {string} [suffix] URL suffix
 * @returns {Promise<boolean>}
 */

async function verifyHttpChallenge(authz, challenge, keyAuthorization, suffix = `/.well-known/acme-challenge/${challenge.token}`) {
    const httpPort = axios.defaults.acmeSettings.httpChallengePort || 80;
    const challengeUrl = `http://${authz.identifier.value}:${httpPort}${suffix}`;

    /* May redirect to HTTPS with invalid/self-signed cert - https://letsencrypt.org/docs/challenge-types/#http-01-challenge */
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });

    log(`Sending HTTP query to ${authz.identifier.value}, suffix: ${suffix}, port: ${httpPort}`);
    const resp = await axios.get(challengeUrl, { httpsAgent });
    const data = (resp.data || '').replace(/\s+$/, '');

    log(`Query successful, HTTP status code: ${resp.status}`);

    if (!data || (data !== keyAuthorization)) {
        throw new Error(`Authorization not found in HTTP response from ${authz.identifier.value}`);
    }

    log(`Key authorization match for ${challenge.type}/${authz.identifier.value}, ACME challenge verified`);
    return true;
}

/**
 * Walk DNS until TXT records are found
 */

async function walkDnsChallengeRecord(recordName, resolver = dns,deep = 0) {

    let records = [];

    /* Resolve TXT records */
    try {
        log(`检查域名 ${recordName} 的TXT记录`);
        const txtRecords = await resolver.resolveTxt(recordName);

        if (txtRecords && txtRecords.length) {
            log(`找到 ${txtRecords.length} 条 TXT记录（ ${recordName}）`);
            log(`TXT records: ${JSON.stringify(txtRecords)}`);
            records = records.concat(...txtRecords);
        }
    } catch (e) {
        log(`解析 TXT 记录出错, ${recordName} :${e.message}`);
    }

    /* Resolve CNAME record first */
    try {
        log(`检查是否存在CNAME映射: ${recordName}`);
        const cnameRecords = await resolver.resolveCname(recordName);

        if (cnameRecords.length) {
            const cnameRecord = cnameRecords[0];
            log(`已找到${recordName}的CNAME记录，将检查: ${cnameRecord}`);
            let res= await  walkTxtRecord(cnameRecord,deep+1);
            if (res && res.length) {
                log(`从CNAME中找到TXT记录: ${JSON.stringify(res)}`);
                records = records.concat(...res);
            }
        }else{
            log(`没有CNAME映射（${recordName}）`);
        }
    } catch (e) {
        log(`检查CNAME出错（${recordName}） :${e.message}`);
    }
    return records
}

export async function walkTxtRecord(recordName,deep = 0) {
    if(deep >5){
        log(`walkTxtRecord too deep (#${deep}) , skip walk`)
        return []
    }

    const txtRecords = []
    try {
        /* Default DNS resolver first */
        log('从本地DNS服务器获取TXT解析记录');
        const res = await walkDnsChallengeRecord(recordName,dns,deep);
        if (res && res.length > 0) {
            for (const item of res) {
                txtRecords.push(item)
            }
        }

    } catch (e) {
        log(`本地获取TXT解析记录失败:${e.message}`)
    }

    try{
        /* Authoritative DNS resolver */
        log(`从域名权威服务器获取TXT解析记录`);
        const authoritativeResolver = await util.getAuthoritativeDnsResolver(recordName);
        const res = await walkDnsChallengeRecord(recordName, authoritativeResolver,deep);
        if (res && res.length > 0) {
            for (const item of res) {
                txtRecords.push(item)
            }
        }
    }catch (e) {
        log(`权威服务器获取TXT解析记录失败:${e.message}`)
    }

    if (txtRecords.length === 0) {
        throw new Error(`没有找到TXT解析记录（${recordName}）`);
    }
    return txtRecords;
}

/**
 * Verify ACME DNS challenge
 *
 * https://datatracker.ietf.org/doc/html/rfc8555#section-8.4
 *
 * @param {object} authz Identifier authorization
 * @param {object} challenge Authorization challenge
 * @param {string} keyAuthorization Challenge key authorization
 * @param {string} [prefix] DNS prefix
 * @returns {Promise<boolean>}
 */

async function verifyDnsChallenge(authz, challenge, keyAuthorization, prefix = '_acme-challenge.') {
    const recordName = `${prefix}${authz.identifier.value}`;
    log(`本地校验TXT记录）: ${recordName}`);
    let recordValues = await walkTxtRecord(recordName);
    //去重
    recordValues = [...new Set(recordValues)];
    log(`DNS查询成功, 找到 ${recordValues.length} 条TXT记录：${recordValues}`);
    if (!recordValues.length || !recordValues.includes(keyAuthorization)) {
        throw new Error(`没有找到需要的DNS TXT记录: ${recordName}，期望:${keyAuthorization},结果:${recordValues}`);
    }

    log(`关键授权匹配成功（${challenge.type}/${recordName}）:${keyAuthorization}，校验成功， ACME challenge verified`);
    return true;
}

/**
 * Verify ACME TLS ALPN challenge
 *
 * https://datatracker.ietf.org/doc/html/rfc8737
 *
 * @param {object} authz Identifier authorization
 * @param {object} challenge Authorization challenge
 * @param {string} keyAuthorization Challenge key authorization
 * @returns {Promise<boolean>}
 */

async function verifyTlsAlpnChallenge(authz, challenge, keyAuthorization) {
    const tlsAlpnPort = axios.defaults.acmeSettings.tlsAlpnChallengePort || 443;
    const host = authz.identifier.value;
    log(`Establishing TLS connection with host: ${host}:${tlsAlpnPort}`);

    const certificate = await util.retrieveTlsAlpnCertificate(host, tlsAlpnPort);
    log('Certificate received from server successfully, matching key authorization in ALPN');

    if (!isAlpnCertificateAuthorizationValid(certificate, keyAuthorization)) {
        throw new Error(`Authorization not found in certificate from ${authz.identifier.value}`);
    }

    log(`Key authorization match for ${challenge.type}/${authz.identifier.value}, ACME challenge verified`);
    return true;
}

/**
 * Export API
 */

export default {
    'http-01': verifyHttpChallenge,
    'dns-01': verifyDnsChallenge,
    'tls-alpn-01': verifyTlsAlpnChallenge,
};
