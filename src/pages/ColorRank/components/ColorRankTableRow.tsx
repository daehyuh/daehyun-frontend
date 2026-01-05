import React from "react";
import styled from "styled-components";
import type {Property} from "csstype";
import {Text} from "@/components";
import RankUser from "@/constant/RankUser";
import type {RankGuild} from "@/constant/RankGuild";

type CommonTableRowProps = {
    type: "user" | "guild";
    data: RankUser | RankGuild;
    backgroundColor?: Property.BackgroundColor;
    borderBottomColor?: Property.BorderColor;
    hoverBackgroundColor?: Property.BackgroundColor;
    color?: Property.Color;
    height?: Property.Height;
};

const StyledTableRow = styled.tr<{
    color?: Property.Color;
    height?: Property.Height;
    hoverBackgroundColor?: Property.BackgroundColor;
    borderBottomColor?: Property.BorderColor;
}>`
    border-bottom: 1px solid ${({borderBottomColor}) => borderBottomColor};
    transition: background-color 0.2s ease, transform 0.2s ease;
    color: ${({color}) => color};
    height: ${({height}) => height};

    &:hover {
        background-color: ${({hoverBackgroundColor}) => hoverBackgroundColor};
        transform: translateY(-1px);
    }
`;

type RankStyle = {
    background: string;
    color: string;
    border: string;
    shadow: string;
    textShadow?: string;
};

const rankStyles: Record<number, RankStyle> = {
    1: {
        background: 'linear-gradient(135deg, #fff4bf, #f0c350)',
        color: '#3e2a00',
        border: '1px solid rgba(240, 195, 80, 0.65)',
        shadow: '0 10px 24px rgba(240, 195, 80, 0.25)',
        textShadow: '0 1px 1px rgba(255, 255, 255, 0.6)',
    },
    2: {
        background: 'linear-gradient(135deg, #f4f7fb, #cfd7e6)',
        color: '#2e3644',
        border: '1px solid rgba(207, 215, 230, 0.7)',
        shadow: '0 10px 24px rgba(207, 215, 230, 0.25)',
        textShadow: '0 1px 1px rgba(255, 255, 255, 0.5)',
    },
    3: {
        background: 'linear-gradient(135deg, #f6e5d4, #d7a46a)',
        color: '#3f2d18',
        border: '1px solid rgba(215, 164, 106, 0.65)',
        shadow: '0 10px 24px rgba(215, 164, 106, 0.22)',
        textShadow: '0 1px 1px rgba(255, 255, 255, 0.45)',
    },
};

const getRankStyle = (rank?: number): Partial<RankStyle> => {
    if (!rank) return {};
    return rankStyles[rank] ?? {};
};

const RankBadge = styled.span<{ $rank?: number }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 64px;
    padding: 8px 12px;
    border-radius: ${({theme}) => theme.radii.pill};
    font-weight: ${({theme}) => theme.typography.weights.bold};
    letter-spacing: 0.02em;
    ${({$rank, theme}) => {
        const style = getRankStyle($rank);
        return `
            background: ${style.background ?? 'rgba(255, 255, 255, 0.04)'};
            color: ${style.color ?? theme.colors.textPrimary};
            border: ${style.border ?? '1px solid rgba(255, 255, 255, 0.08)'};
            box-shadow: ${style.shadow ?? 'inset 0 1px 0 rgba(255, 255, 255, 0.04)'};
            text-shadow: ${style.textShadow ?? 'none'};
        `;
    }}
`;

const CellStack = styled.div`
    display: inline-flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing.sm};
`;

const ColorSwatch = styled.span<{ $color: string }>`
    width: 24px;
    height: 24px;
    border-radius: ${({theme}) => theme.radii.sm};
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: ${({$color}) => $color};
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.4);
`;

const GuildBackground = styled.span<{ $background: string; $textColor: string }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 64px;
    padding: 6px 10px;
    border-radius: ${({theme}) => theme.radii.sm};
    background: ${({$background}) => $background};
    color: ${({$textColor}) => $textColor};
    font-weight: ${({theme}) => theme.typography.weights.semibold};
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.3);
`;

const ScoreBadge = styled.span<{ $highlight?: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing.xs};
    padding: 6px 10px;
    border-radius: ${({theme}) => theme.radii.sm};
    background: ${({$highlight, theme}) => $highlight ? 'rgba(91, 228, 155, 0.12)' : theme.colors.surfaceMuted};
    color: ${({$highlight, theme}) => $highlight ? theme.colors.success : theme.colors.textPrimary};
    font-weight: ${({theme}) => theme.typography.weights.semibold};
`;

const MetaText = styled(Text)`
    color: ${({theme}) => theme.colors.textSecondary};
    font-size: ${({theme}) => theme.typography.sizes.sm};
    line-height: ${({theme}) => theme.typography.lineHeights.snug};
`;

const formatHex = (value?: string): { hex: string; display: string } => {
    if (!value || value.length === 0) return {hex: "#000000", display: "-"};
    const hex = value.startsWith("#") ? value : `#${value}`;
    return {hex, display: hex};
};

const formatScore = (score?: number | null) => {
    if (score === undefined || score === null || Number.isNaN(score)) return "-";
    const rounded = Math.round(score * 100) / 100;
    const fixed = rounded.toFixed(2);
    return fixed.endsWith(".00") ? Math.round(rounded).toString() : fixed;
};

const formatRank = (rank?: number) => {
    if (rank === undefined || rank === null) return "-";
    return `${rank}위`;
};

function renderUserRow(rankUser: RankUser) {
    const {hex, display} = formatHex(rankUser.color);
    const isBlackNickname = rankUser.isBlack ?? rankUser.closeness >= 90;
    const rankValue = rankUser.rank;

    return (
        <>
            <td>
                <RankBadge $rank={rankValue}>{formatRank(rankValue)}</RankBadge>
            </td>
            <td>
                <Text fontWeight="600">{rankUser.nickname}</Text>
            </td>
            <td>
                <CellStack>
                    <ColorSwatch $color={hex}/>
                    <MetaText>{display}</MetaText>
                </CellStack>
            </td>
            <td>
                <ScoreBadge $highlight={isBlackNickname}>
                    {isBlackNickname && <span aria-label="검닉 인증">✅</span>}
                    {formatScore(rankUser.closeness)}
                </ScoreBadge>
            </td>
        </>
    );
}

function renderGuildRow(rankGuild: RankGuild) {
    const {hex: initialHex, display: initialDisplay} = formatHex(rankGuild.initial_color);
    const {hex: backgroundHex, display: backgroundDisplay} = formatHex(rankGuild.initial_background_color);
    const rankValue = rankGuild.rank;

    return (
        <>
            <td>
                <RankBadge $rank={rankValue}>{formatRank(rankValue)}</RankBadge>
            </td>
            <td>
                <Text fontWeight="600">{rankGuild.guild_name}</Text>
                <br/>
                <MetaText>{`${(rankGuild.guild_point ?? 0).toLocaleString()} GP`}</MetaText>
            </td>
            <td>
                <CellStack>
                    <GuildBackground $background={backgroundHex} $textColor={initialHex}>
                        {rankGuild.guild_initial}
                    </GuildBackground>
                    <MetaText>{backgroundDisplay}</MetaText>
                </CellStack>
            </td>
            <td>
                <ScoreBadge>{formatScore(rankGuild.initial_background_closeness)}</ScoreBadge>
            </td>
        </>
    );
}

const CommonTableRow = ({
    type,
    data,
    backgroundColor,
    borderBottomColor = '#2E313E',
    hoverBackgroundColor = '#1A1C28',
    color = 'white',
    height = '56px',
}: CommonTableRowProps) => {
    return (
        <StyledTableRow
            borderBottomColor={borderBottomColor}
            hoverBackgroundColor={hoverBackgroundColor}
            color={color}
            height={height}
            style={{backgroundColor: backgroundColor}}
        >
            {type === "user"
                ? renderUserRow(data as RankUser)
                : renderGuildRow(data as RankGuild)}
        </StyledTableRow>
    );
};

export default CommonTableRow;
